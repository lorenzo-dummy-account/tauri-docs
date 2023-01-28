import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# 特徴

<DocCardList items={useCurrentSidebarCategory().items}/>
