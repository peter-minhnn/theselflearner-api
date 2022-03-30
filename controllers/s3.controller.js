const fs = require('fs');
const db = require("../models");
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESSKEYID,
    secretAccessKey: process.env.AWS_SECRETKEY
});
var formidable = require('formidable');
const Course = db.course;

exports.upload = async (req, res) => {
    var form = new formidable.IncomingForm();
    const response = {
        id: '',
        key: '',
        error: ''
    }

    form.parse(req, function (err, fields, files) {
        response.id = fields.id;
        // Read content from the file
        const fileContent = fs.createReadStream(files.File.filepath);

        // Setting up S3 upload parameters
        const params = {
            Bucket: process.env.AWS_S3BUCKETNAME,
            Key: `courses/img/${fields.id}/${files.File.originalFilename}`, // File name you want to save as in S3
            Body: fileContent
        };

        // Uploading files to the bucket
        s3.upload(params, function (err, data) {
            if (err) {
                response.error = err;
                throw err;
            }
            console.log(`File uploaded successfully. ${data.Location}`);
            response.key = data.Location;
            Course.updateOne({ "_id": response.id }, { avatar: data.Location }).exec((err, course) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                res.status(200).send({ message: "Course was updated successfully!", code: 201, data: course });
            });
        });
    });

    

    return response;
}