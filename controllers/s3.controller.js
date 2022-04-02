const fs = require('fs');
const db = require("../models");
const AWS = require('aws-sdk');
// AWS.config.update({ region: 'ap-southeast-1' });

var formidable = require('formidable');
const Course = db.course;
const User = db.user;
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
            console.log('accessKeyId ', keys[0].accessKeyId);
            console.log('secretAccessKey ', keys[0].secretAccessKey);
            const s3 = new AWS.S3({
                params: { Bucket: process.env.AWS_S3BUCKETNAME },
                accessKeyId: keys[0].accessKeyId,
                secretAccessKey: keys[0].secretAccessKey
            });

            var params = {
                Key: `courses/images/${fields.id}/${fields.oldImage.substring(fields.oldImage.lastIndexOf('/') + 1)}`
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
                // console.log(`File uploaded successfully. ${data.Location}`);
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

/**
    * Copyright 2010-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
    *
    * This file is licensed under the Apache License, Version 2.0 (the "License").
    * You may not use this file except in compliance with the License. A copy of
    * the License is located at
    *
    * http://aws.amazon.com/apache2.0/
    *
    * This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
    * CONDITIONS OF ANY KIND, either express or implied. See the License for the
    * specific language governing permissions and limitations under the License.
*/
exports.getListS3Objects = (req, res) => {
    // ABOUT THIS NODE.JS SAMPLE: This sample is part of the SDK for JavaScript Developer Guide topic at
    // https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-creating-buckets.html
    Aws.find().exec((err, keys) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        const s3 = new AWS.S3({
            accessKeyId: keys[0].accessKeyId,
            secretAccessKey: keys[0].secretAccessKey
        });

        var bucketParams = {
            Bucket: process.env.AWS_S3BUCKETNAME
        }
        var allKeys = [];
        // Call S3 to obtain a list of the objects in the bucket
        getListS3(s3, bucketParams);

        function getListS3(s3, bucketParams) {
            s3.listObjectsV2(bucketParams, function (err, data) {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                } else {
                    var contents = data.Contents;
                    contents.forEach(function (content) {
                        allKeys.push(content);
                    });
                    // console.log('contents ', contents)

                    if (data.IsTruncated) {
                        params.ContinuationToken = data.NextContinuationToken;
                        // console.log("get further list...");
                        getListS3(s3, bucketParams);
                    }
                    else {
                        res.status(200).send({ message: "Get all s3 objects successfully!", code: 200, s3objects: allKeys });
                    }
                }
            });
        }
    })
}

exports.uploadS3Object = async (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        // Read content from the file
        const fileContent = fs.createReadStream(files.File.filepath);
        Aws.find().exec((err, keys) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            const s3 = new AWS.S3({
                params: { Bucket: process.env.AWS_S3BUCKETNAME },
                accessKeyId: keys[0].accessKeyId,
                secretAccessKey: keys[0].secretAccessKey
            });

            // Setting up S3 upload parameters
            var params = {
                Key: '', // File name you want to save as in S3
                Body: fileContent,
                ContentType: files.File.mimetype,
                ACL: 'public-read'
            };

            switch (fields.uploadType) {
                case 'general':
                    params.Key = `${fields.parentFolder}/${fields.folderType}/${files.File.originalFilename}`;
                    break;
                case 'user':
                    params.Key = `${fields.parentFolder}/${fields.folderType}/${fields.id}/${files.File.originalFilename}`;
                    break;
                default:
                    params.Key = `${fields.parentFolder}/${fields.folderType}/${fields.id}/${files.File.originalFilename}`;
            }

            // Uploading files to the bucket
            s3.upload(params, function (err, data) {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                // console.log(`File uploaded successfully. ${data.Location}`);
                if (fields.uploadType === 'user') {
                    User.updateOne({ "_id": files.id }, { avatar: data.Location }).exec((err, user) => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }
                        res.status(200).send({ message: "User avatar was updated successfully!", code: 201 });
                    });
                }
                else {
                    res.status(200).send({ message: "S3 was uploaded successfully!", code: 201 });
                }
            });
        })
    });
}

exports.deleteS3Object = async (req, res) => {
    Aws.find().exec((err, keys) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        const s3 = new AWS.S3({
            params: { Bucket: process.env.AWS_S3BUCKETNAME },
            accessKeyId: keys[0].accessKeyId,
            secretAccessKey: keys[0].secretAccessKey
        });

        // Setting up S3 delete parameters
        var params = {
            Key: req.body.key, // File name you want to delete as in S3
        };

        // Uploading files to the bucket
        s3.deleteObject(params, function (err, data) {
            if (err) {
                res.status(500).send({ message: err });
                    return;
            }
            // console.log(`File uploaded successfully. ${data.Location}`);
            res.status(200).send({ message: "S3 object was deleted successfully!", code: 201 });
        });
    })
}