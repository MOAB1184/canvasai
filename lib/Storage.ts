import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const WASABI_ENDPOINT = `https://s3.${process.env.WASABI_REGION}.wasabisys.com`;

export class Storage {
  private static client = new S3Client({
    region: process.env.WASABI_REGION || "us-east-1",
    endpoint: WASABI_ENDPOINT,
    credentials: {
      accessKeyId: process.env.WASABI_ACCESS_KEY || "",
      secretAccessKey: process.env.WASABI_SECRET_KEY || "",
    },
  });

  static async uploadFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${Date.now()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      // ACL: "public-read", // Removing ACL as it might be blocked by bucket policies
    });

    try {
      await this.client.send(command);

      // Generate a presigned URL for reading (valid for 1 hour)
      const getCommand = new GetObjectCommand({
        Bucket: process.env.WASABI_BUCKET_NAME,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.client, getCommand, { expiresIn: 3600 });
      return signedUrl;
    } catch (error) {
      console.error("Wasabi upload failed:", error);
      throw error;
    }
  }

  static async deleteFile(fileUrl: string) {
    try {
      // Extract key from URL (handling presigned URLs with query params)
      const urlObj = new URL(fileUrl);
      const pathname = urlObj.pathname; // e.g. /bucket-name/key
      // Remove leading slash and bucket name if present in path (path style)
      // Wasabi/S3 usually does /bucket/key for path style or bucket.host/key for virtual host
      // Our endpoint is https://s3.region.wasabisys.com, so it's likely path style: /bucket/key

      let key = pathname;
      if (key.startsWith("/")) key = key.substring(1);

      // If the path starts with the bucket name, remove it
      const bucketName = process.env.WASABI_BUCKET_NAME || "";
      if (key.startsWith(`${bucketName}/`)) {
        key = key.substring(bucketName.length + 1);
      }

      // Decode URI components (spaces, etc)
      key = decodeURIComponent(key);

      console.log(`Attempting to delete key: ${key}`);

      const command = new DeleteObjectCommand({
        Bucket: process.env.WASABI_BUCKET_NAME,
        Key: key,
      });

      await this.client.send(command);
      console.log(`Deleted file from Wasabi: ${key}`);
    } catch (error) {
      console.error("Wasabi delete failed:", error);
      // Don't throw, just log. We don't want to break the flow if cleanup fails.
    }
  }
}
