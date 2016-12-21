module.exports = (struct_name, content, height) => {
  return `        <node id="n0::n1">
          <data key="d4"/>
          <data key="d6">
            <y:UMLClassNode>
              <y:Geometry height="137.0" width="425.0" x="218.0" y="147.5390625"/>
              <y:Fill color="#FFCC00" transparent="false"/>
              <y:BorderStyle color="#000000" type="line" width="1.0"/>
              <y:NodeLabel alignment="center" autoSizePolicy="content" fontFamily="Dialog" fontSize="13" fontStyle="bold" hasBackgroundColor="false" hasLineColor="false" height="19.1328125" horizontalTextPosition="center" iconTextGap="4" modelName="custom" textColor="#000000" verticalTextPosition="bottom" visible="true" width="104.57861328125" x="160.210693359375" y="3.0">${ struct_name }<y:LabelModel>
                  <y:SmartNodeLabelModel distance="4.0"/>
                </y:LabelModel>
                <y:ModelParameter>
                  <y:SmartNodeLabelModelParameter labelRatioX="0.0" labelRatioY="0.0" nodeRatioX="0.0" nodeRatioY="-0.03703090122767855" offsetX="0.0" offsetY="0.0" upX="0.0" upY="-1.0"/>
                </y:ModelParameter>
              </y:NodeLabel>
              <y:UML clipContent="true" constraint="" omitDetails="false" stereotype="" use3DEffect="true">
                <y:AttributeLabel/>
                <y:MethodLabel>${ content }</y:MethodLabel>
              </y:UML>
            </y:UMLClassNode>
          </data>
        </node>`
}