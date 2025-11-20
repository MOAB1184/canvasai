import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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
      ACL: "public-read", // Assuming we want it accessible by RunPod
    });

    try {
      await this.client.send(command);
      // Construct the public URL
      return `${WASABI_ENDPOINT}/${process.env.WASABI_BUCKET_NAME}/${key}`;
    } catch (error) {
      console.error("Wasabi upload failed:", error);
      throw error;
    }
  }

  static async deleteFile(fileUrl: string) {
    try {
      // Extract key from URL
      const urlParts = fileUrl.split("/");
      const key = urlParts[urlParts.length - 1];

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
