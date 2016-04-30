<?php


namespace OracionOnline\Models;

/**
 * @Entity
 * @Table(name="moves")
 */
class Move
{
    /**
     * @var $id integer
     * @Id @Column(type="integer") @GeneratedValue
     */
    public $id;

    /**
     * @var $game Game
     * @ManyToOne(targetEntity="Game")
     */
    public $game;
    /**
     * @var $player User
     * @ManyToOne(targetEntity="User")
     */
    public $player;

    /**
     * @var string
     * @Column(type="string")
     */
    public $moveType;
    /**
     * @var string
     * @Column(type="string")
     */
    public $moveArgument;
}