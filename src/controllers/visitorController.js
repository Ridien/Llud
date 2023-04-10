const db = require('../models')
const User = db.users
const Card = db.cards
const Board = db.boards
const Register = db.register
const UserBoard = db.userboards
const Permission = db.permission
const PermissionUserCard = db.permissionUserCard


exports.createAccount = async (req, res, next) => {
    const code = req.body.code
    const nickname = req.body.username
    const password = User.generateHash(req.body.password)
    try {
        if(req.body.password.length < 6){
            return res.status(422).send({
                message: "A Senha precisa ter pelo menos 6 caracteres"
            });
        }
        const permissionQuery = await Register.findAll(
            {
                where: {
                    permission_code: code
                }
            }
        )
        if (!permissionQuery.length) {
            return res.status(401).send({
                message: "Cadastro não autorizado. Verifique o código de permissão e tente novamente."
            });
        }
        await User.create({
            password: password,
            nickname: nickname
        })
        await Register.destroy({
            where: {
                permission_code: code
            }
        })
        res.status(201).json({ message: "Successfully Registered" })

    } catch (error) {
        res.status(500).send({
            message:
                error.message || "Some error occurred while creating the User."
        });
    }
}