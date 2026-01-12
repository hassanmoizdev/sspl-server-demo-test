-- CreateTable
CREATE TABLE "PostLiking" (
    "id" SERIAL NOT NULL,
    "like" BOOLEAN,
    "post_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostLiking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostLiking" ADD CONSTRAINT "PostLiking_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
