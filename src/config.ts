type navbarItem = {
  title: string
  href?: string
  children?: navbarItem[]
}

export const navbar: navbarItem[] = [
  {
    title: 'Docs',
    href: '/docs',
  },
  {
    title: 'References',
    children: [
      {
        title: 'JavaScript API',
        href: '/api/core-js',
      },
      {
        title: 'Rust API',
        href: '/api/core-rust',
      },
      {
        title: 'Tauri Config',
        href: '/api/core-config',
      },
      {
        title: 'Tauri CLI',
        href: '/api/core-cli',
      },
    ],
  },
  {
    title: 'About',
    href: '/about',
  },
]

export const locales = ['en', 'zh-cn', 'es', 'ko', 'fr', 'it']
