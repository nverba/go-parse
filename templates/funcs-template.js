module.exports = (module_name, content) => {
  return `  <graph edgedefault="directed" id="G">
    <data key="d0"/>
    <node id="n0" yfiles.foldertype="group">
      <data key="d4"/>
      <data key="d6">
        <y:ProxyAutoBoundsNode>
          <y:Realizers active="0">
            <y:GroupNode>
              <y:Geometry height="109.4609375" width="320.83984375" x="308.580078125" y="185.26953125"/>
              <y:Fill color="#CAECFF84" transparent="false"/>
              <y:BorderStyle color="#666699" type="dotted" width="1.0"/>
              <y:NodeLabel alignment="right" autoSizePolicy="node_width" backgroundColor="#99CCFF" borderDistance="0.0" fontFamily="Dialog" fontSize="15" fontStyle="plain" hasLineColor="false" height="21.4609375" horizontalTextPosition="center" iconTextGap="4" modelName="internal" modelPosition="t" textColor="#000000" verticalTextPosition="bottom" visible="true" width="320.83984375" x="0.0" y="0.0">${ module_name }</y:NodeLabel>
              <y:Shape type="roundrectangle"/>
              <y:State closed="false" closedHeight="50.0" closedWidth="50.0" innerGraphDisplayEnabled="false"/>
              <y:Insets bottom="15" bottomF="15.0" left="15" leftF="15.0" right="15" rightF="15.0" top="15" topF="15.0"/>
              <y:BorderInsets bottom="4" bottomF="4.4609375" left="1" leftF="0.919921875" right="14" rightF="13.919921875" top="4" topF="3.5390625"/>
            </y:GroupNode>
            <y:GroupNode>
              <y:Geometry height="50.0" width="85.0" x="95.0" y="95.0"/>
              <y:Fill color="#CAECFF84" transparent="false"/>
              <y:BorderStyle color="#666699" type="dotted" width="1.0"/>
              <y:NodeLabel alignment="right" autoSizePolicy="node_width" backgroundColor="#99CCFF" borderDistance="0.0" fontFamily="Dialog" fontSize="15" fontStyle="plain" hasLineColor="false" height="21.4609375" horizontalTextPosition="center" iconTextGap="4" modelName="internal" modelPosition="t" textColor="#000000" verticalTextPosition="bottom" visible="true" width="85.0" x="0.0" y="0.0">${ module_name }</y:NodeLabel>
              <y:Shape type="roundrectangle"/>
              <y:State closed="true" closedHeight="50.0" closedWidth="85.0" innerGraphDisplayEnabled="false"/>
              <y:Insets bottom="15" bottomF="15.0" left="15" leftF="15.0" right="15" rightF="15.0" top="15" topF="15.0"/>
              <y:BorderInsets bottom="0" bottomF="0.0" left="0" leftF="0.0" right="0" rightF="0.0" top="0" topF="0.0"/>
            </y:GroupNode>
          </y:Realizers>
        </y:ProxyAutoBoundsNode>
      </data>
      <graph edgedefault="directed" id="n0:">
        <node id="n0::n0">
          <data key="d6">
            <y:GenericNode configuration="ShinyPlateNodeWithShadow">
              <y:Geometry height="50.0" width="276.0" x="324.5" y="225.26953125"/>
              <y:Fill color="#B394BD" transparent="false"/>
              <y:BorderStyle hasColor="false" type="line" width="1.0"/>
              <y:NodeLabel alignment="left" autoSizePolicy="content" fontFamily="Dialog" fontSize="12" fontStyle="plain" hasBackgroundColor="false" hasLineColor="false" height="31.9375" horizontalTextPosition="center" iconTextGap="4" modelName="custom" textColor="#000000" verticalTextPosition="bottom" visible="true" width="248.83984375" x="13.580078125" y="9.03125">${ content }
<y:LabelModel>
                  <y:SmartNodeLabelModel distance="4.0"/>
                </y:LabelModel>
                <y:ModelParameter>
                  <y:SmartNodeLabelModelParameter labelRatioX="0.0" labelRatioY="0.0" nodeRatioX="0.0" nodeRatioY="0.0" offsetX="0.0" offsetY="0.0" upX="0.0" upY="-1.0"/>
                </y:ModelParameter>
              </y:NodeLabel>
            </y:GenericNode>
          </data>
        </node>
      </graph>
    </node>
  </graph>`
}