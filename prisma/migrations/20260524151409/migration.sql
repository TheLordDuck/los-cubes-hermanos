-- AlterTable
CREATE SEQUENCE archetypes_id_seq;
ALTER TABLE "Archetypes" ALTER COLUMN "id" SET DEFAULT nextval('archetypes_id_seq');
ALTER SEQUENCE archetypes_id_seq OWNED BY "Archetypes"."id";
