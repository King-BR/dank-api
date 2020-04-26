const express = require("express");
const app = express();
const Canvas = require("canvas");
const Jimp = require("jimp");
const GIFEnc = require('gifencoder');


/*
Returns middleware that only parses json and only looks at
requests where the Content-Type header matches the type option. 
*/
app.use(express.json());

/*
Returns middleware that only parses urlencoded bodies and only looks at
requests where the Content-Type header matches the type option. 
*/
app.use(express.urlencoded({ extended: false }));

let port = 3000
app.listen(port)
console.log("API ligada na porta: " + port)

app.get('', async (req, res) => {
    res.status(200).json({
        message: 'oi'
    })
})

app.get('/api/v1/:name', async (req, res) => {
    // If the path parameter is not specified, we will return a status 400.
    switch (req.params.name) {
        default: {
            res.status(404).json({
                message: `Endpoint '${req.params.name}' not found`,
                status: 404
            });
            break;
        }
        case 'endpoints': {
            res.status(200).json({
                endpoints: ['blur', 'triggered', 'beautiful', 'bobross'],
                status: 200
            })
            break;
        }
        case 'blur': {
            try {
            if(req.query && req.query.url) {
                // Returns the value of 'url' in the console.
                //console.log(req.query.url);

                // https://cdn.discordapp.com/attachments/633463187647234050/638141625066848284/backgroundcodigo.jpg
                const background = await Canvas.loadImage(req.query.url)
                const canvas = Canvas.createCanvas(background.naturalWidth, background.naturalHeight)
                const ctx = canvas.getContext('2d')

                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                let strength = req.query.strength || 2;
                blur(strength)
                
                function blur(strength) {
                    ctx.globalAlpha = 0.5;
                    for (var y = -strength; y <= strength; y += 2) {
                        for (var x = -strength; x <= strength; x += 2) {
                            ctx.drawImage(canvas, x, y);

                            if (x >= 0 && y >= 0)
                                ctx.drawImage(canvas, -(x-3), -(y-1));
                        };
                    };

                    ctx.globalAlpha = 1.0;
                }

                let data = canvas.toBuffer()
                res.header('Content-type', 'image/png');
                res.status(200).send(data)

            } else {
                if(!req.query || !req.query.url) {
                    res.status(400).json({ message: 'Bad Request, you must specify the \'url\' query parameter.', status: 400 });
                }
            }
            break;
        
            } catch (err) {
                console.log(err)
                res.status(500).json({
                    message: `Unexpected error. Leave an issue on github or contact me (KingBR#3793) on discord`,
                    status: 500
                })
            }
        }
        case 'triggered': {
            if(!req.query || !req.query.url) {
                res.status(400).json({
                    message: 'Bad Request, you must specify the \'url\' query parameter.',
                    status: 400
                })
                return;
            }

            try {
                function getRandomInt(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }

                const options = {
                    frames: 8,
                    size: 512
                };
    


                const base = new Jimp(options.size, options.size);
                const avatar = await Jimp.read(req.query.url);
                const text = await Jimp.read('assets/triggered.png');

                avatar.resize(560, 560);
                avatar.color([
                    { apply: 'mix', params: ['#FF0000', '30'] }
                ]);

                text.scaleToFit(535, 90);

                const frames = [];
                const buffers = [];
                const encoder = new GIFEnc(512, 512);
                const stream = encoder.createReadStream();
                let temp;

                stream.on('data', buffer => buffers.push(buffer));
                stream.on('end', () => {
                    res.header('Content-type', 'image/gif');
                    res.status(200).send(Buffer.concat(buffers))
                });

                for (let i = 0; i < options.frames; i++) {
                    temp = base.clone();

                    if (i === 0) temp.composite(avatar, -16, -16);
                    else temp.composite(avatar, -32 + getRandomInt(-16, 16), -32 + getRandomInt(-16, 16));

                    if (i === 0) temp.composite(text, -10, 430);
                    else temp.composite(text, -12 + getRandomInt(-8, 8), 430 + getRandomInt(-0, 12));

                    frames.push(temp.bitmap.data);
                }

                encoder.start();
                encoder.setRepeat(0);
                encoder.setDelay(20);
                for (const frame of frames) encoder.addFrame(frame);
                encoder.finish();

            } catch (err) {
                console.log(err)
                res.status(500).json({
                    message: 'Unexpected error. Post an issue on github or contact me (KingBR#3793) on discord',
                    status: 500
                })
            }
            break;
        }
        case 'beautiful': {
            if(!req.query || !req.query.url) {
                res.status(400).json({
                    message: 'Bad Request, you must specify the \'url\' query parameter.',
                    status: 400
                })
                return;
            }

            try {
                const canvas = Canvas.createCanvas(600, 600)
                const ctx = canvas.getContext('2d')

                let url = await Canvas.loadImage(req.query.url);
                let image = await Canvas.loadImage('assets/beautiful.png');

                let start1X = 400,
                    start1Y = 32;
                let end1 = 159;

                ctx.drawImage(url, start1X, start1Y, end1, end1);

                let start2X = 400;
                    start2Y = 336;
                    let end2 = 160;

                ctx.drawImage(url, start2X, start2Y, end2, end2);
                
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                
                let data = canvas.toBuffer()
                res.header('Content-type', 'image/png');
                res.status(200).send(data)

            } catch (err) {
                console.log(err)
                res.status(500).json({
                    message: 'Unexpected error. Post an issue on github or contact me (KingBR#3793) on discord',
                    status: 500
                })
            }
            break;
        }
        case 'bobross': {
            if(!req.query || !req.query.url) {
                res.status(400).json({
                    message: 'Bad Request, you must specify the \'url\' query parameter.',
                    status: 400
                })
                return;
            }

            try {
                let url = await Canvas.loadImage(req.query.url);
                let image = await Canvas.loadImage('assets/bobross.png');
                
                const canvas = Canvas.createCanvas(image.naturalWidth, image.naturalHeight)
                const ctx = canvas.getContext('2d')

                ctx.drawImage(image, 0, 0)

                let data = canvas.toBuffer()
                res.header('Content-type', 'image/png');
                res.status(200).send(data)
            } catch (err) {
                console.log(err)
                res.status(500).json({
                    message: 'Unexpected error. Post an issue on github or contact me (KingBR#3793) on discord',
                    status: 500
                })
            }
        }
    }
});