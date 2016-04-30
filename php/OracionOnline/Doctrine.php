<?php


namespace OracionOnline;


use Doctrine\ORM\EntityManager;
use Doctrine\ORM\Mapping\Driver\DatabaseDriver;
use Doctrine\ORM\Tools\Setup;

class Doctrine
{
    const USER = "\\OracionOnline\\Models\\User";
    /**
     * @var EntityManager
     */
    private static $entityManager;

    public static function getEntityManager() : EntityManager
    {
        if (self::$entityManager == null) {
            self::Bootstrap();
        }
        return self::$entityManager;
    }

    public static function Bootstrap()
    {
        $isDevMode = true;
        $paths = array("php/OracionOnline/Models");
        $config = Setup::createAnnotationMetadataConfiguration($paths, $isDevMode);
        $conn = array(
          'driver' => 'mysqli',
          'user'   => 'petr',
          'host' => 'localhost',
          'password'   => 'UnsafeDataPassword',
          'dbname' => 'oracion'
        );
        Doctrine::$entityManager = EntityManager::create($conn, $config);
    }

    public static function persistAndFlush($databaseObject)
    {
        self::getEntityManager()->persist($databaseObject);
        self::getEntityManager()->flush($databaseObject);
    }
}