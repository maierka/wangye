# 校园AI交易市场 - 客户端版本

一个简洁的校园二手交易市场Web应用，适合在校园内使用。

## 功能特点

- ✅ 用户注册与登录
- ✅ 商品发布与管理
- ✅ 商品浏览与搜索
- ✅ 商品分类筛选
- ✅ 收藏商品功能
- ✅ 关注卖家功能
- ✅ 个人主页展示

## 技术栈

- **后端**: Python Flask
- **数据库**: SQLite
- **前端**: HTML/CSS/JavaScript (原生)

## 快速部署

### 本地运行

1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 运行应用：
```bash
python app.py
```

3. 打开浏览器访问：http://localhost:5000

## 文件结构

```
├── app.py              # Flask主应用入口
├── database.py         # 数据库初始化
├── models.py           # 数据模型
├── routes.py           # 路由和API
├── requirements.txt    # 依赖列表
├── static/             # 静态资源
│   ├── css/style.css   # 样式文件
│   └── js/main.js      # JavaScript文件
└── templates/          # HTML模板
    ├── base.html       # 基础模板
    ├── index.html      # 首页
    ├── login.html      # 登录页
    ├── register.html   # 注册页
    ├── publish.html    # 发布商品页
    ├── detail.html     # 商品详情页
    ├── favorites.html  # 我的收藏页
    └── profile.html    # 个人主页
```

## 注意事项

- 此版本为客户端版本，不包含管理后台
- 数据存储在本地 SQLite 数据库文件中
- 如需部署到云端，建议使用 Vercel、Railway 或 Render 等平台

## 许可证

MIT License
