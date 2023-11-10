-- CreateTable
CREATE TABLE "EmpresaLocation" (
    "ruc" VARCHAR(11) NOT NULL,
    "local" TEXT NOT NULL,

    CONSTRAINT "EmpresaLocation_pkey" PRIMARY KEY ("ruc")
);

-- CreateTable
CREATE TABLE "PrintableFile" (
    "id" TEXT NOT NULL,
    "empresaRuc" VARCHAR(11) NOT NULL,
    "printerName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "printed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PrintableFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uuid" VARCHAR(100) NOT NULL,
    "username" VARCHAR(20) NOT NULL,
    "password" VARCHAR(200) NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmpresaLocation_ruc_local_key" ON "EmpresaLocation"("ruc", "local");

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "PrintableFile" ADD CONSTRAINT "PrintableFile_empresaRuc_fkey" FOREIGN KEY ("empresaRuc") REFERENCES "EmpresaLocation"("ruc") ON DELETE RESTRICT ON UPDATE CASCADE;
