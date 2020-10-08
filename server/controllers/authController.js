const bcrypt = require('bcryptjs');

module.exports = {
    register: async (req, res) => {
        const { username, password, isAdmin } = req.body,
            db = req.app.get('db');

        const result = await db.get_user([username]),
            existingUser = result[0];

        if(existingUser) {
            return res.status(409).send('Username already taken');
        }

        const salt = bcrypt.genSaltSync(10),
            hash = bcrypt.hashSync(password, salt);

        const registeredUser = await db.register_user([isAdmin, username, hash]),
            user = registeredUser[0];

        req.session.user = {isAdmin: user.is_admin, username: user.username, id: user.id };
        res.status(201).send(req.session.user);
    },
    login: async (req, res) => {
        const { username, password } = req.body,
            db = req.app.get('db'),
            foundUser = await db.get_user([username]),
            user = foundUser[0];
            if(!user) {
                return res.status(401).send('User not found. Please register as a new user before logging in');
            }

            const isAuthenticated = bcrypt.compareSync(password, user.hash);

            if(!isAuthenticated) {
                return res.status(403).send('Incorrect password');
            }

            delete user.password;
            req.session.user = {isAdmin: user.is_admin, id: user.id, username: user.username };
        
            res.status(202).send(req.session.user);
    },
    logout:  (req, res) => {
        req.session.destroy();
        res.sendStatus(200);
    }
}