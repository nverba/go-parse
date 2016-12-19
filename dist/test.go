+ GetOne (*ctx.MisContext, string)) : void 
- init () : void 
+ GetLogin (*ctx.MisContext) : void 
+ PostLogin (*ctx.MisContext) : void 
+ GetRegister (*ctx.MisContext) : void 
+ PostRegister (*ctx.MisContext) : void 
+ GetLogout (*ctx.MisContext) : void 
+ AddUserToExtra (*ctx.MisContext, *dbo.User, map[string]interface{}) : void 
+ PostResetRequest (*ctx.MisContext) : void 
+ errorPageIfTrue (*ctx.MisContext, bool, ...string) : (bool) 
+ verifyExtraCode (*ctx.MisContext, string) : (bool) 
+ unescapeCode (string) : (string) 
+ GetResetPassword (*ctx.MisContext) : void 
+ decodeName (string) : (string) 
+ PostResetPassword (*ctx.MisContext) : void 
