const express = require('express');
const {
    User
} = require('./dbUtil.js');
const app = express();
app.use(express.json())

const SECRET = 'nt8q9ntvqnvtmct980cnt0nqvt4';
const jwt = require('jsonwebtoken');

app.listen(2020, () => {
    console.log('http://localhost:2020')
})

const allowCors = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
};
app.use(allowCors); //使用跨域中间件

app.get('/api/users', async (req, res) => {
    const users = await User.find()
    res.json(users)
})

app.post('/api/register', async (req, res) => {
    const {
        username,
        password,
        confirmPwd
    } = req.body;

    const usr =  await User.findOne({
        username:req.body.username
    })
    if (usr) {
        return res.send({
            msg: '用户名已经存在'
        })
    }
    if (password !== confirmPwd) {
        return res.send({
            msg: '两次输入密码不一致'
        })
    }
    const user = await User.create({
        username,
        password
    })
    res.send({
        msg: '注册成功'
    })
})

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        username: req.body.username
    })
    if (!user) {
        return res.send({
            msg: '用户名不存在'
        })
    }
    const isPasswordValid = require('bcrypt').compareSync(
        req.body.password,
        user.password
    )
    if (!isPasswordValid) {
        return res.send({
            msg: '用户名或密码错误'
        })
    }
    const tokenData = jwt.sign({
        id: String(user._id)
    }, SECRET)
    res.send({
        token: tokenData,
        msg:'登陆成功'
    })
})



const userMiddleware = async (req, res, next) => {
    const raw = String(req.headers.authorization).split(' ').pop();
    const {
        id
    } = jwt.verify(raw, SECRET)
    req.user = await User.findById(id)
    next()
}

app.get('/api/profile', userMiddleware, async (req, res) => {
    res.send(req.user)
})