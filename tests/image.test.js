const request = require('supertest');
const app = require('../server');

describe('upload image with /image/upload-picture', ()=>{
    it('should return a link', async ()=>{
        const res = await request(app)
            .post('/image/upload-picture')
            .attach('picture', "tests/resources/red.png");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('link');
    });

    it('should return file format error', async ()=>{
        const res = await request(app)
            .post('/image/upload-picture')
            .attach('picture', "tests/resources/picture_zip.zip");

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toEqual('Only PNG and JPG are supported');
    })
});
