<?php


namespace OracionOnline\Models;

/**
 * @Entity
 * @Table(name="games")
 */
class Game
{
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
}