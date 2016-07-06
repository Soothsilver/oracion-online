<?php


namespace OracionOnline\Models;

/**
 * @Entity
 * @Table(name="games")
 */
class Game
{
    /**
     * Game is waiting for the second player to connect.
     */
    const STATUS_WAITING = 1;
    /**
     * Both players have connected and are now playing the game.
     */
    const STATUS_PLAYING = 2;
    /**
     * The game has been cancelled or completed.
     */
    const STATUS_TERMINATED = 3;
    
   /**
    * @var $id integer
    * @Id @Column(type="integer") @GeneratedValue
    */
    public $id;
    /**
     * @var $firstPlayer User
     * @ManyToOne(targetEntity="User")
     */
    public $firstPlayer;
    /**
     * @var $secondPlayer User
     * @ManyToOne(targetEntity="User")
     */
    public $secondPlayer;

    /**
     * @var $status int
     * @Column(type="integer")
     */
    public $status = Game::STATUS_WAITING;

    /**
     * @var \DateTime
     * @Column(type="datetime")
     */
    public $lastInteractionDate;
}