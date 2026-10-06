-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "ecpayTradeNo" TEXT,
ADD COLUMN     "merchantTradeNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_merchantTradeNo_key" ON "Order"("merchantTradeNo");
