const request = require('supertest');
const app = require('../server');

describe('upload', ()=>{
    it('upload png and should return a link', async ()=>{
        const res = await request(app)
            .post('/image/upload')
            .attach('picture', "tests/resources/red.png");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('link');
    });

    it('upload jpeg and should return a link', async ()=>{
        const res = await request(app)
            .post('/image/upload')
            .attach('picture', "tests/resources/yellow.jpeg");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('link');
    });

    it('upload zip and should return a link', async ()=>{
        const res = await request(app)
            .post('/image/upload')
            .attach('picture', "tests/resources/picture_zip.zip");

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('link');
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
