/*
  Warnings:

  - You are about to drop the `materias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questoes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "questoes" DROP CONSTRAINT "questoes_autorId_fkey";

-- DropForeignKey
ALTER TABLE "questoes" DROP CONSTRAINT "questoes_materiaId_fkey";

-- DropTable
DROP TABLE "materias";

-- DropTable
DROP TABLE "questoes";

-- DropEnum
DROP TYPE "Dificuldade";

-- CreateTable
CREATE TABLE "subjects" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "professor_id" INTEGER NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "enunciado" TEXT NOT NULL,
    "dificuldade" INTEGER NOT NULL,
    "resposta_correta" TEXT,
    "disciplina_id" INTEGER NOT NULL,
    "autor_id" INTEGER NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
