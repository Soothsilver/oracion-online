<?php
namespace OracionOnline;
use Doctrine\Common\Collections\Criteria;
use OracionOnline\Models\Game;
use OracionOnline\Models\Move;
use OracionOnline\Models\User;

class AjaxResponder
{
    private $session;
    public function __construct(Session $session)
    {
        $this->session = $session;
    }

    /**
     * @param string $action
     * @param array $data
     * @return string
     */
    public function invoke(string $action, array $data) : string
    {
        if (!$this->session->isLoggedIn()) {
            return "false";
        }
        switch($action) {
            case "move":
                if (!isset($data["gameId"])) {
                    return false;
                }
                if (!isset($data["moveType"])) {
                return false;
                }
                if (!isset($data["moveArgument"])) {
                    return false;
                }
                $move = new Move();
                /**
                 * @var $game Game
                 */
                $game = Doctrine::getEntityManager()->find(Doctrine::GAME, $data["gameId"]);
                if ($game->firstPlayer->id != $this->session->getUser()->id &&
                  $game->secondPlayer->id != $this->session->getUser()->id) {
                    return false;
                }
                $move->game = $game;
                $move->moveType = $data["moveType"];
                $move->player = $this->session->getUser();
                $move->moveArgument = $data["moveArgument"];
                Doctrine::persistAndFlush($move);
                return json_encode([
                    "success" => true
                ]);
            case "getMoves":
                if (!isset($data["gameId"])) {
                    return false;
                }
                if (!isset($data["lastMoveId"])) {
                    return false;
                }
                $gameId = $data["gameId"];
                $lastMoveId = $data["lastMoveId"];
                $game = Doctrine::getEntityManager()->find(Doctrine::GAME, $gameId);
                $moves = Doctrine::getEntityManager()->getRepository(Doctrine::MOVE);
                $criteria = Criteria::create()
                  ->where(Criteria::expr()->eq("game", $game))
                  ->andWhere(Criteria::expr()->gt("id", $lastMoveId))
                  ->orderBy(array("id" => Criteria::ASC))                  
                  ->setFirstResult(0);
                $newMoves = $moves->matching($criteria);
                $arrayOutput = array();
                foreach ($newMoves as $key => $value) {
                 $arrayOutput[] = [
                     "id" => $value->id,
                     "moveType" => $value->moveType,
                     "moveArgument" => json_decode($value->moveArgument),
                     "yours" => $value->player->id == $this->session->getUser()->id
                 ];
                }
                return json_encode($arrayOutput);
            case "joinGame":
                if (!isset($data["id"])) {
                    return json_encode(["success" => false, "reason" => "Data ID not set." ]);
                }
                if (!isset($data["deck"])) {
                    return json_encode(["success" => false, "reason" => "Deck not set." ]);
                }
                $gameId = $data["id"];
                $deckname = $data["deck"];
                try {
                    Doctrine::getEntityManager()->transactional(function () use ($gameId, $deckname) {
                        /**
                         * @var $game Game
                         */
                        $game = Doctrine::getEntityManager()->find(Doctrine::GAME, $gameId);
                        if ($game->secondPlayer != null) {
                            throw new \Exception("V této hře jsou již dva hráči.");
                        } else if ($game->status == Game::STATUS_TERMINATED) {
                            throw new \Exception("Tato hra již skončila.");
                        }
                        $game->secondPlayer = $this->session->getUser();
                        $game->status = Game::STATUS_PLAYING;
                        $move = new Move();
                        $move->game = $game;
                        $move->moveArgument = json_encode($deckname);
                        $move->player = $this->session->getUser();
                        $move->moveType = SharedConstants::MOVE_DECK_NAME;
                        Doctrine::getEntityManager()->persist($move);
                    });
                    return json_encode(["success" => true]);
                } catch (\Exception $ex) {
                    return json_encode(["success" => false, "reason" => $ex->getMessage()]);
                }
            case "hasSomebodyJoined":
                if (!isset($data["id"])) {
                    return json_encode(["success" => false, "reason" => "Data ID not set." ]);
                }
                $gameId = $data["id"];
                /**
                 * @var $game Game
                 */
                $game = Doctrine::getEntityManager()->find(Doctrine::GAME, $gameId);
                if ($game->secondPlayer == null) {
                    return json_encode(["success" => true, "joined" => false]);
                } else {
                    return json_encode(["success" => true, "joined" => true]);
                }
            case "cancelGameAsCreator":
                if (!isset($data["id"])) {
                    return json_encode(["success" => false, "reason" => "Data ID not set." ]);
                }
                $gameId = $data["id"];
                try {
                    Doctrine::getEntityManager()->transactional(function () use ($gameId) {
                        /**
                         * @var $game Game
                         */
                        $game = Doctrine::getEntityManager()->find(Doctrine::GAME, $gameId);
                        if ($game->firstPlayer->id == $this->session->getUser()->id) {
                            $game->status = Game::STATUS_TERMINATED;
                        } else {
                            throw new \Exception("You are not the creator.");
                        }
                    });
                    return json_encode(["success" => true]);
                } catch (\Exception $ex) {
                    return json_encode(["success" => false, "reason" => $ex->getMessage()]);
                }
            case "listGames":
                $gamesRepository = Doctrine::getEntityManager()->getRepository(Doctrine::GAME);
                /**
                 * @var $games Game[]
                 */
                $games = $gamesRepository->findAll();
                $targetArray = [];
                foreach($games as $game) {
                    $targetArray[] = [
                        "id" => $game->id,
                        "firstPlayer" => $game->firstPlayer->email,
                        "secondPlayer" => ($game->secondPlayer != null ? $game->secondPlayer->email : null),
                        "status" => $game->status
                    ];
                }
                return json_encode($targetArray);
            case "createGame":
                if (!isset($data["deck"])) {
                    return false;
                }
                $deckname = $data["deck"];
                $game = new Game();
                $game->firstPlayer = $this->session->getUser();
                $moveDeck = new Move();
                $moveDeck->game = $game;
                $moveDeck->moveType = SharedConstants::MOVE_DECK_NAME;
                $moveDeck->moveArgument = json_encode($deckname);
                $moveDeck->player = $this->session->getUser();
                $moveRandom = new Move();
                $moveRandom->game = $game;
                $moveRandom->moveType = SharedConstants::MOVE_RANDOM_SEED;
                $moveRandom->moveArgument = rand(1, 200000);
                $moveRandom->player = $this->session->getUser();
                Doctrine::getEntityManager()->persist($game);
                Doctrine::getEntityManager()->persist($moveDeck);
                Doctrine::getEntityManager()->persist($moveRandom);
                Doctrine::getEntityManager()->flush();
                return json_encode(["id" => $game->id]);
            case "changeQueueState":

                $target = isset($data["targetState"]) ? $data["targetState"] : "false";

                $user = $this->session->getUser();

                $user->queued = ($target == "true" ? true : false);
                Doctrine::persistAndFlush($user);

                return "success";

            case "logout":
                $this->session->logout();
                return "success";
            case "getStatistics":
                $user = $this->session->getUser();
                $dql = Doctrine::getEntityManager()->createQuery(
                    'SELECT COUNT(u.id) FROM \OracionOnline\Models\User u WHERE u.lastHeartbeat > :date');
                $dql->setParameters([
                    'date' => (new \DateTime())->sub(new \DateInterval("PT1M"))
                ]);
                $numOnline = $dql->getSingleScalarResult();
                return json_encode([
                   "gamesPlayed" => $user->gamesStarted,
                   "gamesWon" => $user->gamesWon,
                   "onlineCount" => $numOnline
                ]);
            case "heartbeat":
                $this->session->lastHeartbeat = new \DateTime();
                $user = $this->session->getUser();
                $user->lastHeartbeat = new \DateTime();
                Doctrine::getEntityManager()->persist($user);
                Doctrine::getEntityManager()->flush($user);
                return "success";
        }
        return "false";
    }
}