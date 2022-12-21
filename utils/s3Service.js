const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");


exports.s3Uploadv3 = async (userUuid, files) => {
    const s3Client = new S3Client();

    const params = files.map(file => {
        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `uploads/${userUuid}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        }
    })

    return await Promise.all(params.map(param => s3Client.send(new PutObjectCommand(param))));
}

exports.s3Deletev3 = async (targetPhotos) => {
    const s3Client = new S3Client();
    
    const params = targetPhotos.map(photo => {
        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `uploads/${photo}`,
        }
    })

    return await Promise.all(params.map(param => s3Client.send(new DeleteObjectCommand(param))));
}