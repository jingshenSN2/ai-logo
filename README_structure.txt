├── LICENSE
├── Makefile
├── README.md
├── api
│   └── protected
│       └── edit-image
├── app
│   ├── (auth)
│   │   ├── sign-in
│   │   │   └── [[...sign-in]]
│   │   │       └── page.tsx
│   │   └── sign-up
│   │       └── [[...sign-up]]
│   │           └── page.tsx
│   ├── (default)
│   │   ├── edit
│   │   │   └── [id]
│   │   │       └── page.tsx
│   │   ├── gallery
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api
│   │   ├── get-public-logos
│   │   │   └── route.ts
│   │   ├── get-user-info
│   │   │   └── route.ts
│   │   └── protected
│   │       ├── check-logo-status
│   │       │   └── route.ts
│   │       ├── gen-logo
│   │       │   └── route.ts
│   │       ├── get-user-logos
│   │       │   └── route.ts
│   │       └── update-logo
│   │           └── route.ts
│   ├── favicon.ico
│   ├── globals.css
│   └── layout.tsx
├── components
│   ├── ImageCanvas.tsx
│   ├── ImageEditor
│   ├── ImageEditor.tsx
│   ├── ImageUploader.tsx
│   ├── footer
│   │   └── index.tsx
│   ├── header
│   │   └── index.tsx
│   ├── hero
│   │   └── index.tsx
│   ├── input
│   │   └── index.tsx
│   ├── payment
│   │   └── StripeButton.tsx
│   ├── public-logos
│   │   └── index.tsx
│   ├── social
│   │   └── index.tsx
│   ├── ui
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── skeleton.tsx
│   │   ├── tabs.tsx
│   │   └── toggle-group.tsx
│   ├── user
│   │   └── index.tsx
│   └── user-logos
│       └── index.tsx
├── components.json
├── contexts
│   └── AppContext.tsx
├── debug
│   └── apitest.http
├── deploy.sh
├── extensions.json
├── lib
│   ├── image.ts
│   ├── prompt.ts
│   ├── resp.ts
│   ├── s3.ts
│   └── utils.ts
├── log.txt
├── middleware.ts
├── models
│   ├── db.ts
│   ├── public_logo.ts
│   └── user_logo.ts
├── next-env.d.ts
├── next.config.js
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── preview.png
├── public
│   ├── black_t.jpg
│   ├── grey_t.jpg
│   ├── logo.png
│   ├── template.png
│   └── white_t.jpg
├── services
│   ├── openai.ts
│   └── user.ts
├── settings.json
├── tailwind.config.ts
├── test.js
├── todo.txt
├── tsconfig.json
└── types
    ├── context.d.ts
    ├── logo.d.ts
    ├── tab.d.ts
    └── user.d.ts
