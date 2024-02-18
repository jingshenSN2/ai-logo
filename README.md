# AI Logo

AI Logo Generator, powered by OpenAI's DALL-E models.

## Inspiration

This project is built on a fork of [aiwallpaper](https://github.com/all-in-aigc/aiwallpaper).

## Quick Start

1. clone project

```shell
git clone https://github.com/jingshenSN2/ai-logo.git
```

2. install dependencies

```shell
cd ai-logo
pnpm install
```

3. database & bucket

We use `DynamoDB` for data storage and `S3` for image storage.

You will need 3 tables in `DynamoDB`:

ailogo-db-user: Primary key: `id` (String), Secondary index: `email` (String),
ailogo-db-logo: Primary key: `id` (String), Secondary index: `user_email` (String),
ailogo-db-order: Primary key: `order_no` (String), Secondary index: `user_email` (String).

You will need a bucket in `S3` for image storage with Public access, so that image url can be accessed directly from browser.

4. set environmental values

put `.env.local` under root dir with values list below

```
OPENAI_API_KEY=""

POSTGRES_URL=""

AWS_AK=""
AWS_SK=""
AWS_REGION=""
AWS_BUCKET=""

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

STRIPE_PUBLIC_KEY=""
STRIPE_PRIVATE_KEY=""

WEB_BASE_URI=""
```

5. local development

```shell
pnpm dev
```

open `http://localhost:3000` for preview

## Credit to

- [gpts.works](https://gpts.works) for code reference
- [nextjs](https://nextjs.org/docs) for full-stack development
- [clerk](https://clerk.com/docs/quickstarts/nextjs) for user auth
- [aws s3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html) for image storage
- [stripe](https://stripe.com/docs/development) for payment
- [node-postgres](https://node-postgres.com/) for data processing
- [tailwindcss](https://tailwindcss.com/) for page building
