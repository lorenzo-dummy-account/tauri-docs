从 '@theme/DocCardList'导入DocCardList'; 从 '@docusaurus/theme-common'导入 {useCurrentSidebarCategory}

# 功能

<DocCardList items={useCurrentSidebarCategory().items}/>
