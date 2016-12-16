/*
	Authentication handlers

	Endpoints handlers:
		GET /connect    GetConnect   check cookie, if valid generate and return a new JWT, else redirect to login page
		GET /login      GetLogin     render login page with required theme, lang parameters
		GET /register   GetRegister  render register page for users to signup
		GET /logout     GetLogout    logout and clear session
		POST /login     PostLogin    validate username and password and issue JWT if pass
		POST /register  PostRegister accept user input and create user for app_id
        POST /reset_request   from login page to send email for reseting password
        GET /reset_pass  user link back from reset email

	Parameters:
		app_id        App.Id
		lang          user's language to display on login/register pages, default en
		theme         app's choice of login/register page styles
		redirect_to   url to redirect back to after login

	HTTP headers:  (if not using parameters above)
		X-MisAuth-App_id   =app_id
		X-MisAuth-Lang
		X-MisAuth-Theme
		X-MisAuth-Redirect_to
*/
package auth

import (
	"crypto/md5"
	"encoding/base64"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"
    "net/url"

	"bitbucket.org/makeitsocial/misauth/ctx"
	"bitbucket.org/makeitsocial/misauth/dbo"
)

func GetLogin(c *ctx.MisContext) {
	if c.Query("xu") != "" {
		c.SetCsrfToken(map[string]string{"xu": "1"})
	} else {
		c.SetCsrfToken()
	}
	c.RenderPage("login")
}

func PostLogin(c *ctx.MisContext) {
	if !c.ContainsValidCsrfToken() {
		c.SetErrorMsg("INVALID_CSRF")
		c.RenderPage("login")
		return
	}
	usr := c.ParseUserInput()
	u, err := ctx.VerifyUser(c, usr.Username, usr.Password)
	if err != nil {
		// TODO: if user tried 3 times with wrong password, enable captcha, if 9 times, disable user for 24 hours until password reset
		//1. check session, if retries not found, add retries = 1
		//2. if retries > 3 then show captcha, & add retries ++
		//3. if retries > 9: update user in cache with Status = frozon until release
		//4. send a signal on this with err notfound or wrongpass and IP
		if err == &ctx.NotFound {
			log.Printf("User not found:%+v", usr)
			//TODO: Session.NotFound() //if exceeds 3, enable captcha
		} else if err == &ctx.WrongPass {
			log.Printf("Wrong password:%+v;%+v", usr, u)
			//TODO: Session.WrongPass() //..
		}
		//if err == &dbo.WrongPass  ! not return such msg for security reasons
		c.SetErrorMsg("INVALID_USERPASS") //will be translated
		c.RenderPage("login")
	} else {
		uid := strconv.Itoa(u.Id)
		s := ctx.NewSession(c)
		appid := c.GetAppIdFromQuery("") //c.DefaultPostForm(APP_ID, c.DefaultPostForm(CLIENT_ID, ""))
		s.SaveUserAndAppId(uid, appid)
		if s.Get("xu") != nil {
			AddUserToExtra(c, u, nil)
			s.Del("xu", true)
		}
		SessionAuth(c)
		//TODO: dbo.Send signal on login with uid, & save to Userlogs table
		ctx.SendData("users", "login", ctx.MAP{"id": u.Id, "username": usr.Username, "appid": appid})
	}
}

func GetRegister(c *ctx.MisContext) {
	if c.Query("xu") != "" {
		c.SetCsrfToken(map[string]string{"xu": "1"})
	} else {
		c.SetCsrfToken()
	}
	c.RenderPage("register")
	//TODO: send a signal (to SQS) on this access for tracking or analytics
}

func PostRegister(c *ctx.MisContext) {
	if !c.ContainsValidCsrfToken() {
		c.SetErrorMsg("INVALID_CSRF")
		c.RenderPage("register")
		return
	}
	retfunc := func(msg string) {
		c.SetErrorMsg(msg)
		c.RenderPage("register")
	}
	usr := c.ParseUserInput()
	// log.Printf("++++++++++ usr:%+v",usr)
	u, err := ctx.VerifyUser(c, usr.Username, usr.Password)
	if err == nil && u != nil {
		retfunc("USER_EXISTS")
		return
	}
	appid, er := strconv.Atoi(usr.App_id)
	if er != nil {
		appid = 0
	}
	// password must be at least 8 chars
	if len(usr.Password) < 8 {
		retfunc("PASSWORD_TOOSHORT")
		return
	}
	data := map[string]interface{}{
		"username":   usr.Username,
		"password":   usr.Password,
		"first_name": usr.FirstName,
		"last_name":  usr.LastName,
		"appid":      appid,
		"language":   usr.Lang,
		"app_url":    usr.Redirect_to,
	}
	db, pk := dbo.FindDatabaseForInsert(c.GetShardStore(), "users", data)
	// log.Printf("** PostRegister ** db:%+v\n data:%+v", db, data)
	if pk > 0 {
		data["id"] = pk
	}
	uid, err := db.PostNewUser(data)
	if err != nil {
		log.Printf("  ** db.PostNewUser error:%+v", err)
		retfunc(err.Error())
	} else {
		ids := strconv.Itoa(uid)
		s := ctx.NewSession(c)
		appid := c.GetAppIdFromQuery("") //c.DefaultPostForm(APP_ID, c.DefaultPostForm(CLIENT_ID, ""))
		s.SaveUserAndAppId(ids, appid)
		if s.Get("xu") != nil {
			AddUserToExtra(c, nil, data)
			s.Del("xu", true)
		}
		SessionAuth(c)
		// notify:
		data["id"] = uid
		delete(data, "password")
		ctx.SendData("users", "new", data)
	}
}

func GetLogout(c *ctx.MisContext) {
	//s := Session{context: c}
	//s.ClearAll() //done inside SessionAuth()
	c.Redirect(302, c.DefaultQuery(ctx.REDIRECT_TO, "/login"))
}

const extp = `{"em":"%s","fn":"%s","sn":"%s","ln":"%s"}`

func AddUserToExtra(c *ctx.MisContext, usr *dbo.User, um map[string]interface{}) {
	app := c.GetApp()
	if app == nil {
		log.Printf("addUserToExtra, no App specified")
		return
	}
	extr := ""
	if usr != nil {
		extr = fmt.Sprintf(extp, usr.Username, usr.FirstName, usr.LastName.String, usr.Language.String)
	} else if um != nil {
		extr = fmt.Sprintf(extp, um["username"].(string), um["first_name"].(string), um["last_name"].(string), um["language"].(string))
	} else {
		return
	}
	if app.JwtSecret.Valid {
		es, err := ctx.EncryptWithPubKey(extr, app.JwtSecret.String)
		if err != nil {
			log.Printf("Encrypt with pubkey returns %v", err)
			return
		}
		c.SetExtras(es)
	} else {
		c.Error("App has no pubkey")
	}
}

const (
	RESET_EXPIRE_SECS = 1800 //reset password request expire in half an hour
	RESET_SECRET      = "f48520697662a204f5fe72"
)

// PostResetRequest - request change password
// POST /reset_request
func PostResetRequest(c *ctx.MisContext) {
	if !c.ContainsValidCsrfToken() {
		c.SetErrorMsg("INVALID_CSRF")
		c.RenderPage("login")
		return
	}
	usr := c.ParseUserInput()
	email := usr.Username
	if email == "" {
		email = c.PostForm("email")
		if email == "" {
			c.String(200, "No email address")
			c.Abort()
			return
		}
	}
	db := dbo.FindDatabaseByPrefix(c.GetShardStore(), "users", email, true)
	if db == nil {
		panic("db forusers not found")
	}
	ups, err := db.GetUserByUsername(email)
	if err != nil || len(ups) < 1 {
		c.SetErrorMsg("WRONG_EMAIL")
		c.RenderPage("login")
		return
	}
	u := ups[0].(*dbo.User)
	tstamp := time.Now().Unix() //seconds from 1970-1-1 UTC
	parms := fmt.Sprintf("lang=%s&app_id=%s&theme=%s", usr.Lang, usr.App_id, usr.Theme)
	// fmt.Printf("\n**** parms=%s\n",parms)
	b64email := base64.URLEncoding.EncodeToString([]byte(email))
	msg := fmt.Sprintf("%s.%d", b64email, tstamp)
	hash := md5.Sum([]byte(msg + RESET_SECRET))
	code := url.QueryEscape(fmt.Sprintf("%s.%x", msg, hash))
	//when user clicks that link, decode the email and verify hash, if ok allow enter new passwords.
	data := ctx.MAP{
		"first_name": u.FirstName,
		"code":       code,
		"theme":      usr.Theme,
		"app_id":     usr.App_id,
		"lang":       usr.Lang,
		"user_id":    u.Id,
        "app_url":    usr.Redirect_to,
	}
	ctx.SendData("users", "reset", data)
	//c.RenderDirect("reset", nil)
	c.RenderPage("reset")
	log.Printf("?????????????  reset, data=%+v\n   parms=%+v\n   usr=%+v\n", data, parms,usr)
    log.Printf("reset_pass user=%s, code=%s",u.Username,code)
	c.Status = code + "&" + parms //for testing
}

func errorPageIfTrue(c *ctx.MisContext, cond bool, msgs ...string) bool {
	if cond {
		msg := "Bad Request"
		if len(msgs) > 0 {
			msg = msgs[0]
		}
		c.Error(msg)
		c.RenderDirect("error", msg)
		c.Abort()
	}
	return cond
}

func verifyExtraCode(c *ctx.MisContext, code string) bool {
	if errorPageIfTrue(c, code == "", "code missing") {
		return false
	}
    
	ss := strings.Split(code, ".")
	if errorPageIfTrue(c, len(ss) < 3, "invalid code") {
        c.Error("code="+code)
		return false
	}
	b64email := ss[0]
	tsec := ss[1]
	hash := ss[2]
	tohash := fmt.Sprintf("%s.%s%s", b64email, tsec, RESET_SECRET)
	chash := fmt.Sprintf("%x", md5.Sum([]byte(tohash)))
	if errorPageIfTrue(c, chash != hash, "hash invalid") {
		fmt.Printf("hash :%s\nchash:%s\n", hash, chash)
		return false
	}
	if secs, err := strconv.Atoi(tsec); err == nil {
		now := time.Now().Unix()
		dif := now - int64(secs)
		if dif > RESET_EXPIRE_SECS {
			errorPageIfTrue(c, true, "request expired")
			return false
		}
	} else {
		errorPageIfTrue(c, true, err.Error())
		return false
	}
	return true
}

func unescapeCode(scode string) string {
    cs, err := url.QueryUnescape(scode)
    if err != nil {
        log.Printf("!!! unescapeCode error:%s", scode)
        return ""
    }
    return cs
}

// GetResetPassword - resets password by entering new one
// GET /reset_pass?code=base64(email).md5(email+secret)
func GetResetPassword(c *ctx.MisContext) {
	code := unescapeCode(c.Query("code"))
	if !verifyExtraCode(c, code) {
		return
	}
	// fmt.Printf("*** usr=%+v",usr)
	if c.Query("xu") != "" {
		c.SetCsrfToken(map[string]string{"xu": "1"})
	} else {
		c.SetCsrfToken()
	}
	// usr := c.ParseUserInput()
	// usr.Extra = code //
	// usr.Csrf = c.GetCsrfToken()
	// c.RenderDirect("newpass", usr)
	c.RenderPage("newpass") //will call ParseUserInput inside
}

func decodeName(extra string) string {
	ss := strings.Split(extra, ".")
	dec, err := base64.URLEncoding.DecodeString(ss[0])
	if err != nil {
		return ""
	}
	return string(dec)
}

// PostResetPassword - saves users new password and redirect to login page
// POST /reset_pass
func PostResetPassword(c *ctx.MisContext) {
	if !c.ContainsValidCsrfToken() {
		c.SetErrorMsg("INVALID_CSRF")
		errorPageIfTrue(c, true, "Invalid CSRF")
		return
	}
	usr := c.ParseUserInput()
	if usr.Password == "" {
		c.SetErrorMsg("password not given")
		// c.RenderDirect("newpass", usr)
		c.RenderPage("newpass")
		return
	}
    
    log.Printf("\n$$ ParseUserInput return:%+v", usr)
    
    code := unescapeCode(c.DefaultPostForm("code",""))
    
	if !verifyExtraCode(c, code) {
		return
	}
	usr.Username = decodeName(code)
    log.Printf("* ResetPass, decoded username=%s", usr.Username)
	//save user's new password
	db := dbo.FindDatabaseByPrefix(c.GetShardStore(), "users", usr.Username, false)
	if db == nil {
		panic("users database not found")
	}
	sql := "UPDATE users SET password=? WHERE username=?"
	r, err := db.DoExec(sql, dbo.EncryptPassword(usr.Password), usr.Username)
	if err != nil && errorPageIfTrue(c, err != nil, err.Error()) {
		log.Printf("PostResetPassword error:%v", err)
		return
	}
    log.Printf("### ResetPass.DoExec(SET password=[%s] WHERE username=[%s]) result=%+v", usr.Password, usr.Username, r)
	ups, err := db.GetUserByUsername(usr.Username)
	if err != nil {
		log.Printf("Updated user not found")
	}
    log.Printf("* ResetPass, user readback:%+v",ups)
	if len(ups) > 0 {
		cache := c.GetCache()
		cache.DeleteUser(ups[0].(*dbo.User))
	}
    log.Println("* ResetPass, User cache deleted")
	if usr.Redirect_to == "/" {
		usr.Redirect_to = "/login"
	}
	url := usr.BuildParams(usr.Redirect_to)
    log.Printf("* ResetPass, redirect to %s",url)
	c.Redirect(302, url)
}
