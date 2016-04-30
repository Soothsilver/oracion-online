<?php


namespace OracionOnline;


use Doctrine\ORM\EntityManager;
use Doctrine\ORM\Mapping\Driver\DatabaseDriver;
use Doctrine\ORM\Tools\Setup;

class Doctrine
{
    /**
     * @var EntityManager
     */
    public static $entityManager;

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
}