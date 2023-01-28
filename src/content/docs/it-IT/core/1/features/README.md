importa DocCardList da '@theme/DocCardList'; importa {useCurrentSidebarCategory} da '@docusaurus/theme-common';

# Caratteristiche

<DocCardList items={useCurrentSidebarCategory().items}/>
