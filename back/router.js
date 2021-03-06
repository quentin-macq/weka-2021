const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const auth = require('./auth.js')();
const cfg = require('./config.js');
const pool = require('./data/pg');

const saltRounds = 10;

const router = express.Router();
module.exports = router;

router
    .use(auth.initialize());

router
    .post('/signup', async (req, res) => {
        try {
            bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
                await pool.query(
                    'insert into player(name, password) values ($1, $2) returning player_id',
                    [req.body.name, hash]
                );

                return res.sendStatus(201);
            });

        } catch (err) {
            console.error('ERROR SIGNUP:', err);
            res.sendStatus(401);
        }
    })

    .post("/token", async (req, res) => {
        try {
            const result = await pool.query('select player_id, password from player where name = $1', [req.body.name]);
            const match = await bcrypt.compare(req.body.password, result.rows[0].password);

            if (match) {
                const token = jwt.sign({
                    id: result.rows[0].player_id
                }, cfg.jwtSecret, {
                    expiresIn: '1h'
                });

                return res.json({
                    token: token
                });
            }


            res.sendStatus(200);

        } catch (err) {
            console.error("ERROR TOKEN:", err);
            res.sendStatus(401);
        }
    })

    .get('/quiz',
        async (req, res) => {
            try {
                const result = await pool.query('select * from quiz');
                res.json(result.rows);
            } catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        })

    .get('/quiz/:id',
        async (req, res) => {
            try {
                const result = await pool.query(
                    'select * from question as q where q.quiz_id = ' + req.params.id
                );
                res.json(result.rows);
            } catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        })

    .post('/create_quiz', async (req, res) => {
        try {
            await pool.query(
                'insert into quiz(name, image, theme) values ($1, $2, $3) returning quiz_id',
                [req.body.name, req.body.image, req.body.theme]
            );

        } catch (err) {
            console.error('ERROR CREATING QUIZ:', err);
            res.sendStatus(401);
        }
    })

    .delete('/delete_quiz/:id',
        async (req, res) => {
            try {
                const result = await pool.query(
                    'delete from quiz where quiz_id = ' + req.params.id
                );
                res.json(result.rows);
            } catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        })

    .post('/create_question', async (req, res) => {
        try {
            await pool.query(
                'insert into question(quiz_id, sentence, answer_1, answer_2, answer_3, answer_4, correct_answer, nb_points) values ($1, $2, $3, $4, $5, $6, $7, $8) returning question_id',
                [req.body.quiz_id, req.body.sentence, req.body.answer_1, req.body.answer_2,
                    req.body.answer_3, req.body.answer_4, req.body.correct_answer, req.body.nb_points]);

        } catch (err) {
            console.error('ERROR CREATING QUESTION:', err);
            res.sendStatus(401);
        }
    })

    .get('/theme',
        async (req, res) => {
            try {
                const result = await pool.query('select * from theme');
                res.json(result.rows);
            } catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        })

    .get('/question',
        async (req, res) => {
            try {
                const result = await pool.query('select * from question');
                res.json(result.rows);
            } catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        })

    .get('/player',
        async (req, res) => {
            try {
                const result = await pool.query('select * from player');
                res.json(result.rows);
            } catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        })

    .use((req, res) => {
        res.status(404);
        res.json({
            error: 'Page not found'
        });
    });
