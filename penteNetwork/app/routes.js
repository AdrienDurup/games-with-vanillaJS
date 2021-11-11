const xpr=require("express");
const router=xpr.Router();
const routeLogic=require("./controllers/routesControllers");


// router.use(xpr.json());
// router.use(xpr.urlencoded({extended:true}));

/* on définit les routes statiques */
router.use(xpr.static("assets"));

router.use(routeLogic.log);
router.get("/", routeLogic.root);
// router.use(routeLogic.gameControl);
router.get("/create",routeLogic.createGame);
router.get("/join",routeLogic.joinGame);
// router.get("/game/:name",routeLogic.gamePage);
router.get("/game/:game/:name", routeLogic.session);
router.use(routeLogic.error404);

module.exports=router;