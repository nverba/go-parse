module.exports = (content, height) => {
  return `        <node id="n0::n0">
          <data key="d6">
            <y:GenericNode configuration="ShinyPlateNodeWithShadow">
              <y:Geometry height="36.0" width="425.0" x="218.0" y="97.7908935546875"/>
              <y:Fill color="#B394BD" transparent="false"/>
              <y:BorderStyle hasColor="false" type="line" width="1.0"/>
              <y:NodeLabel alignment="left" autoSizePolicy="content" fontFamily="Dialog" fontSize="12" fontStyle="plain" hasBackgroundColor="false" hasLineColor="false" height="17.96875" horizontalTextPosition="center" iconTextGap="4" modelName="custom" textColor="#000000" verticalTextPosition="bottom" visible="true" width="77.552734375" x="173.7236328125" y="9.015625">${ content }<y:LabelModel>
                  <y:SmartNodeLabelModel distance="4.0"/>
                </y:LabelModel>
                <y:ModelParameter>
                  <y:SmartNodeLabelModelParameter labelRatioX="0.0" labelRatioY="0.0" nodeRatioX="0.0" nodeRatioY="0.0" offsetX="0.0" offsetY="0.0" upX="0.0" upY="-1.0"/>
                </y:ModelParameter>
              </y:NodeLabel>
            </y:GenericNode>
          </data>
        </node>`
}