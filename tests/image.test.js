const request = require('supertest');
const app = require('../server');

describe('upload', ()=>{
    it('upload jpeg and should return a link', async ()=>{
        const res = await request(app)
            .post('/image/upload')
            .attach('picture', "tests/resources/yellow.jpeg");

        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('link');
    });

    it('upload zip and should return links', async ()=>{
        const res = await request(app)
            .post('/image/upload')
            .attach('picture', "tests/resources/picture_zip.zip");

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('link');
    });

    it('upload png with 300px by 168px, should return two thumbnails, respect to original aspect ratio, with width 32 and 64', async ()=>{
        const res = await request(app)
            .post('/image/upload')
            .attach('picture', "tests/resources/red.png");

        expect(res.statusCode).toEqual(200);
        expect(res.body.length === 2).toBe(true);
        expect(res.body[0].width).toEqual(32);
        expect(res.body[0].height).toEqual(18);
        expect(res.body[1].width).toEqual(64);
        expect(res.body[1].height).toEqual(36);
    });

    it('upload png with 32px by 18px and should return one thumbnail with original size', async ()=>{
        const res = await request(app)
            .post('/image/upload')
            .attach('picture', "tests/resources/red_32_18.png");

        expect(res.statusCode).toEqual(200);
        expect(res.body.length === 1).toBe(true);
        expect(res.body[0].width).toEqual(32);
        expect(res.body[0].height).toEqual(18);
    });

    it('upload pdf and should return file format error', async ()=>{
        const res = await request(app)
            .post('/image/upload')
            .attach('picture', "tests/resources/sample.pdf");

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toEqual('Only PNG, JPG and ZIP are supported');
    })
});
