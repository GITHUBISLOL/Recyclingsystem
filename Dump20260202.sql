CREATE DATABASE  IF NOT EXISTS `recyclingdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `recyclingdb`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: recyclingdb
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bin_details`
--

DROP TABLE IF EXISTS `bin_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bin_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recycler_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `material_type` enum('Plastic','Metal','Paper','Glass') NOT NULL,
  `weight` decimal(10,2) NOT NULL,
  `bin_number` int NOT NULL,
  `status` enum('Pending','Approved','Rejected','Submitted') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `submitted_to_blockchain` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bin_details`
--

LOCK TABLES `bin_details` WRITE;
/*!40000 ALTER TABLE `bin_details` DISABLE KEYS */;
INSERT INTO `bin_details` VALUES (1,'sasuke','user@example.com','Plastic',1.00,1,'Pending','2025-12-18 14:31:58','2025-12-18 14:31:58',0),(2,'sasuke','sd@gmail.com','Plastic',2.00,3,'Submitted','2025-12-18 14:56:56','2026-01-26 13:38:15',1),(3,'sasuke','sd@gmail.com','Plastic',2.00,3,'Rejected','2025-12-18 15:00:56','2025-12-18 16:34:55',0),(4,'sasuke','sd@gmail.com','Metal',200.00,12,'Rejected','2025-12-18 17:25:09','2026-01-26 12:37:12',0),(5,'nezuko','nezuko@gmail.com','Metal',2.00,2,'Pending','2025-12-19 10:00:46','2025-12-19 10:00:46',0),(6,'sasuke','sd@gmail.com','Plastic',15.00,1,'Pending','2026-01-25 15:04:55','2026-01-25 15:04:55',0),(7,'sasuke','sd@gmail.com','Plastic',5.00,2,'Pending','2026-01-26 10:08:34','2026-01-26 10:08:34',0),(8,'sasuke','sd@gmail.com','Metal',67.00,3,'Submitted','2026-01-26 12:23:04','2026-01-26 13:38:10',1),(9,'sasuke','sd@gmail.com','Plastic',67.00,2,'Submitted','2026-01-26 12:36:34','2026-01-26 13:38:06',1),(10,'sasuke','sd@gmail.com','Metal',1000.00,2,'Submitted','2026-01-26 13:00:46','2026-01-26 13:38:00',1);
/*!40000 ALTER TABLE `bin_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nea`
--

DROP TABLE IF EXISTS `nea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nea` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nea`
--

LOCK TABLES `nea` WRITE;
/*!40000 ALTER TABLE `nea` DISABLE KEYS */;
INSERT INTO `nea` VALUES (1,'nea_admin','neaPassword123','2025-12-18 06:17:39');
/*!40000 ALTER TABLE `nea` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recycler`
--

DROP TABLE IF EXISTS `recycler`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recycler` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `points` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recycler`
--

LOCK TABLES `recycler` WRITE;
/*!40000 ALTER TABLE `recycler` DISABLE KEYS */;
INSERT INTO `recycler` VALUES (2,'sasuke','12','sd@gmail.com','2025-12-18 11:59:19',10);
/*!40000 ALTER TABLE `recycler` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `redemption_requests`
--

DROP TABLE IF EXISTS `redemption_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `redemption_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recycler_username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `points_deducted` int DEFAULT NULL,
  `eth_amount` decimal(18,8) DEFAULT NULL,
  `wallet_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `redemption_requests`
--

LOCK TABLES `redemption_requests` WRITE;
/*!40000 ALTER TABLE `redemption_requests` DISABLE KEYS */;
INSERT INTO `redemption_requests` VALUES (1,'sasuke',16350,0.09810000,'0xe6af28b533b31242196055ae2f01b7eb1740062f','Paid','2026-01-26 13:42:30');
/*!40000 ALTER TABLE `redemption_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('XbBqyKn0NVydRZsoRH-DJe4JNuU-uuCX',1769533625,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-01-27T17:07:04.893Z\",\"httpOnly\":true,\"path\":\"/\"},\"recycler\":{\"id\":2,\"username\":\"sasuke\",\"email\":\"sd@gmail.com\"}}'),('d5IG46t2wI4AhzBBiqVxBvJbisxQ1hU9',1769535592,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-01-27T17:07:04.893Z\",\"httpOnly\":true,\"path\":\"/\"},\"recycler\":{\"id\":2,\"username\":\"sasuke\",\"email\":\"sd@gmail.com\"},\"nea\":{\"id\":1,\"username\":\"nea_admin\"}}'),('pD4ri8-XEeurUCNQqlladA195u693EtY',1769533625,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-01-27T17:07:04.893Z\",\"httpOnly\":true,\"path\":\"/\"},\"recycler\":{\"id\":2,\"username\":\"sasuke\",\"email\":\"sd@gmail.com\"}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-02 11:50:47
