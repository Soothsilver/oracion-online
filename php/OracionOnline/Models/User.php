<?php
namespace OracionOnline\Models;

/**
 * @Entity
 * @Table(name="users")
 */
class User
{
    /**
     * @Id @Column(type="integer") @GeneratedValue
     */
    public $id;

    /**
     * @Column(type="string", unique=true)
     */
    public $email;

    /**
     * @Column(type="string")
     */
    public $hashedPassword;

    /**
     * @Column(type="datetime")
     */
    public $lastHeartbeat;

    /**
     * @Column(type="integer")
     */
    public $gamesWon;

    /**
     * @Column(type="integer")
     */
    public $gamesStarted;
    /**
     * @Column(type="boolean")
     */
    public $queued;
}