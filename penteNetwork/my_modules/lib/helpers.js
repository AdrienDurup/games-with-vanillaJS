const ViewRHelpers={
    functionWrap:(funcName)=>{//FOR TEST PURPOSE
        return `\\$\\{\\s*${funcName}\\(\\s*(.*)\\s*\\)\\s*\\}`;
      }
}
module.exports=ViewRHelpers;