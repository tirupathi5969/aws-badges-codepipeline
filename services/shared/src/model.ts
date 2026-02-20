const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({ region: process.env.AWS_REGION || 'ca-central-1' });
import { isBucketNameValid } from './controller';

export class BaseS3Object {
    private _Bucket: string;
    private _Key: string;
    private _Body: Buffer;
    ETag: any;
    Expires: Date;
    ACL: string;
    ContentType: string;
    CacheControl: string;

    get Body(): Buffer {
        return this._Body;
    }

    set Body(buffer: Buffer) {
        this._Body = buffer;
    }

    get Bucket(): string {
        return this._Bucket;
    }

    set Bucket(bucketName: string) {
        if (isBucketNameValid(bucketName)) {
            this._Bucket = bucketName;
        } else {
            throw new Error('Invalid bucket name');
        }
    }

    get Key(): string {
        return this._Key;
    }

    set Key(key: string) {
        this._Key = key;
    }

    constructor(bucketName: string, key: string, body: Buffer) {
        this.Bucket = bucketName;
        this.Key = key;
        this.Body = body;
        this.Expires = new Date('Mon, 01 Jan 1990 00:00:00 GMT');
        this.ACL = 'public-read';
        this.ContentType = 'image/svg+xml';
        this.CacheControl = 'no-cache, no-store';
    }

    private serialize() {
        return {
            Key: this.Key,
            Bucket: this.Bucket,
            Body: this.Body,
            Expires: this.Expires,
            ContentType: this.ContentType,
            CacheControl: this.CacheControl,
        };
    }

    public async uploadObject() {
        const params = this.serialize();
        // Remove ACL if it causes issues, but following previous fix I'll keep it out of params if possible
        // The serialze() currently includes Key, Bucket, Body, Expires, ContentType, CacheControl
        const command = new PutObjectCommand(params);
        try {
            const data = await s3.send(command);
            console.log('Success', data);
            this.ETag = data.ETag;
            return data.ETag;
        } catch (err) {
            const error = err as any;
            const errorMessage = `Failed to upload SVG to S3: ${error}`;
            console.log(errorMessage);
            return errorMessage;
        }
    }
}
