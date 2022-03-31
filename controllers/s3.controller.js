const fs = require('fs');
const db = require("../models");
const AWS = require('aws-sdk');
// AWS.config.update({ region: 'ap-southeast-1' });
const s3 = new AWS.S3({
    params: { Bucket: process.env.AWS_S3BUCKETNAME }
});
var formidable = require('formidable');
const Course = db.course;
const Aws = db.aws;

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
        Aws.find().exec((err, keys) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            s3.config.credentials.accessKeyId = keys[0].accessKeyId;
            s3.config.credentials.secretAccessKey = keys[0].secretAccessKey;

            var params = {
                Key: `courses/images/${fields.id}/${fields.oldImage.substring(fields.oldImage.lastIndexOf('/')+1)}`
            }

            s3.deleteObject(params, function (err, data) {
                if (err) console.log(err, err.stack);  // error
                else console.log(data);                 // deleted
            });

            // Setting up S3 upload parameters
            params = {
                Key: `courses/images/${fields.id}/${files.File.originalFilename}`, // File name you want to save as in S3
                Body: fileContent,
                ContentType: files.File.mimetype,
                ACL: 'public-read'
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
                    res.status(200).send({ message: "Course was updated successfully!", code: 201 });
                });
            });
        })
    });
}