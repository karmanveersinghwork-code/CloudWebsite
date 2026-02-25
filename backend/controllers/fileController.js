const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectVersionsCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const stream = require('stream');

// Use environment region and bucket. Do NOT read or set AWS credentials here;
// the AWS SDK v3 will use the default provider chain which includes the
// EC2 instance profile (IAM role) when running on EC2.
const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET = process.env.AWS_BUCKET;

// Initialize S3 client without explicit credentials so the SDK will automatically
// pick up the EC2 instance role (LabInstanceProfile) when available.
const s3 = new S3Client({ region: REGION });

exports.listFiles = async (req, res) => {
  try {
    if (!BUCKET) {
      console.error('AWS_BUCKET not configured');
      return res.status(500).json({ error: 'Server not configured' });
    }
    const command = new ListObjectsV2Command({ Bucket: BUCKET });
    const data = await s3.send(command);
    const files = (data.Contents || []).map(obj => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified
    }));
    return res.json(files);
  } catch (err) {
    // Log full AWS error for debugging (do not expose secrets to clients)
    console.error('listFiles error:', err);
    return res.status(500).json({ error: 'Failed to list files' });
  }
};

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const key = req.file.originalname;
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: req.file.buffer
    });
    const result = await s3.send(command);
    res.json({ message: 'Upload successful', result });
  } catch (err) {
    console.error('uploadFile error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

exports.downloadFile = async (req, res) => {
  const { filename } = req.params;
  const { versionId } = req.query;
  try {
    const params = { Bucket: BUCKET, Key: filename };
    if (versionId) params.VersionId = versionId;
    const command = new GetObjectCommand(params);
    const data = await s3.send(command);
    // set headers and pipe
    res.setHeader('Content-Type', data.ContentType || 'application/octet-stream');
    res.setHeader('Content-Length', data.ContentLength);
    res.setHeader('Last-Modified', data.LastModified);
    res.setHeader('ETag', data.ETag);
    // stream the body
    const bodyStream = data.Body;
    bodyStream.pipe(res);
  } catch (err) {
    console.error('downloadFile error:', err);
    res.status(500).json({ error: 'Download failed' });
  }
};

exports.deleteFile = async (req, res) => {
  const { filename } = req.params;
  const { versionId } = req.query;
  try {
    const params = { Bucket: BUCKET, Key: filename };
    if (versionId) params.VersionId = versionId;
    const command = new DeleteObjectCommand(params);
    const result = await s3.send(command);
    res.json({ message: 'Delete successful', result });
  } catch (err) {
    console.error('deleteFile error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

exports.listVersions = async (req, res) => {
  const { filename } = req.params;
  try {
    const command = new ListObjectVersionsCommand({
      Bucket: BUCKET,
      Prefix: filename
    });
    const data = await s3.send(command);
    const versions = (data.Versions || []).map(v => ({
      versionId: v.VersionId,
      lastModified: v.LastModified,
      size: v.Size,
      isLatest: v.IsLatest
    }));
    res.json(versions);
  } catch (err) {
    console.error('listVersions error:', err);
    res.status(500).json({ error: 'Failed to list versions' });
  }
};

// Provide aliases to match route handler names expected by routes/fileRoutes.js
exports.getFile = async (req, res) => {
  console.log('getFile called for', req.params.filename);
  return exports.downloadFile(req, res);
};

exports.getVersions = async (req, res) => {
  console.log('getVersions called for', req.params.filename);
  return exports.listVersions(req, res);
};
