# Han-Analytics

· Han-Analytics 是一个简单的网络分析跟踪器和仪表板，托管在被称为赛博菩萨的 Cloudflare 上,无成本稳定运行,每天可达10万次免费统计。

· 域名、服务器、数据库 通通都不用! 托管在 Cloudflare Pages 上即可快速部署网站分析仪表板。


### 部署

- 登录到 [Cloudflare Login](https://dash.cloudflare.com/sign-up)，没有的注册一个 [Cloudflare SignUp](https://dash.cloudflare.com/sign-up)
- 点击 Workers 和 Pages 随便创建一个 workers 并开启 分析引擎，然后复制 workers ID 备用。[操作截图1](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001144.webp)，[操作截图2](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001550.webp)
- 创建一个 [Cloudflare API token](https://dash.cloudflare.com/profile/api-tokens) 备用。[操作截图1](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001058.webp)，[操作截图2](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001090.webp)，[操作截图3](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001118.webp)
- Fork 项目到自己的 Github 账户，修改 `wrangler.toml` 文件中的 `CLOUDFLARE_ACCOUNT_ID` 为自己的 Cloudflare Workers 账户 ID，`CLOUDFLARE_API_TOKEN` 为刚才创建的 API token。
- 登录 Cloudflare 并创建 Pages 项目 ，链接Github仓库，选择刚刚 Fork 的项目，架构选择Vue，部署即可。[操作截图1](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001163.webp)，[操作截图2](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001181.webp)，[操作截图3](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001197.webp)
- cloudflare pages 部署完成后，访问 `https://xxxxxx.pages.dev` 即可访问网站分析仪表板。（注意：首次部署生成的域名可能需要几分钟时间生效，请耐心等待）
- 部署成功后，首次打开页面没有数据，请尽快集成到自己的网站并出现有效访问后，再次打开页面即可看到数据！
- 新增 `密码访问` 及 `网站白名单`，在 `wrangler.toml` 文件中配置，开启密码后，输入密码可访问（默认无需密码），网站白名单功能，加白的网站才可计入统计（默认任意网站都可统计）


