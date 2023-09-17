require([
    "esri/Map",
    "esri/views/MapView",
    "esri/WebScene",
    "esri/views/SceneView",

    "esri/geometry/Mesh",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/layers/ImageryLayer",
    "esri/layers/GeoJSONLayer",

    "esri/widgets/Home"

], function (Map, MapView, WebScene, SceneView, Mesh, Graphic, Point, ImageryLayer, GeoJSONLayer, Home) {

    const webscene = new WebScene({
        ground: {
            opacity: 0
        }
    });

    const view = new SceneView({
        container: "viewDiv",
        map: webscene,
        viewingMode: "global",
        camera: {
            position: [0, 0, 15000],
            heading: 0,
            tilt: 0
        },
        constraints: {
            altitude: {
                max: 50000
            },
            tilt: {
                max: 80
            }
        },
        highlightOptions: {
            color: [255, 241, 58],
            fillOpacity: 0.4
        },
        alphaCompositingEnabled: true,
        environment: {
            lighting: {
              type: "virtual"
            },
            background: {
                type: "color",
                color: [0, 0, 0, 0]
            },
            atmosphereEnabled: false,
            starsEnabled: false,

        },
        spatialReference: {
            wkid: 4326
        },
    });

    //副窗口
    const layer2D = new ImageryLayer({
        url: "http://localhost:6080/arcgis/rest/services/BotW_Map_g/ImageServer"
    });

    const map2D = new Map({
        basemap: "",
        layers: [layer2D]
    });

    const view2D = new MapView({
        container: "viewDiv2D",
        map: map2D,
        constraints: {
            minScale: 250000,
            maxScale: 150
        },
        highlightOptions: {
            color: [255, 241, 58],
            fillOpacity: 0.4
        }
    });

    //加控件
    const home = new Home({
        view: view
    });

    view2D.ui.components = [];
    view.ui.components = [];
    view.ui.add("logoWidget", "bottom-right")
    view.ui.add("soundWidget", "top-right")
    view.ui.add("labelWidget", "top-right")
    view.ui.add("homeWidget", "top-right")
    view.ui.add("compassWidget", "top-right")

    //加点图层
    const renderer = {
        type: "simple",
        symbol: {
            type: "picture-marker",
            url: "Image/film.png",
            width: "32px",
            height: "32px",
            yoffset: "16px"
        }
    };

    const geoJSONLayer2D = new GeoJSONLayer({
        url: "memories.geojson",
        renderer: renderer,
        outFields: ["*"],
        labelsVisible: false,
        labelingInfo: [
            {
                labelPlacement: "above-center",
                labelExpressionInfo: {
                    expression: "$feature.NAME",
                },
                symbol: {
                    type: "text",
                    color: [255, 255, 255, 1],
                    haloColor: [255, 142, 0, 1],
                    haloSize:0.5,
                    font: {
                        size: 12,
                    }
                }
            }
        ]
    });

    map2D.add(geoJSONLayer2D);

    const geojsonlayer = new GeoJSONLayer({
        url: "memories.geojson",//貌似只能用wgs84
        renderer: renderer,
        outFields: ["*"],
        labelsVisible: false,
        labelingInfo: [
            {
                labelPlacement: "above-center",
                labelExpressionInfo: {
                    expression: "$feature.NAME",
                },
                symbol: {
                    type: "label-3d",
                    symbolLayers: [
                        {
                            type: "text",
                            material: {
                                color: [255, 255, 255, 1],
                            },
                            halo: {
                                size: 0.5,
                                color: [255, 142, 0, 1],
                            },
                            font: {
                                size: 12,
                            },
                        },
                    ],
                    verticalOffset: {
                        screenLength: 40,
                        maxWorldLength: 500000,
                        minWorldLength: 0,
                    },
                    callout: {
                        type: "line",
                        size: 0.5,
                        color: [255, 255, 255, 0.9],
                        border: {
                            color: [0, 0, 0, 0.3],
                        },
                    },
                },
            },
        ],
    });
    webscene.add(geojsonlayer);

    //添加模型
    const location = new Point({
        x: 0,
        y: 0,
        z: 0
    });

    Mesh.createFromGLTF(location, "Model/modelNew.gltf")
        .then(function (geometry) {
            const graphic = new Graphic({
                geometry,
                symbol: {
                    type: "mesh-3d", // MeshSymbol3D()
                    symbolLayers: [{
                        type: "fill", // FillSymbol3DLayer()
                        // material: {
                        //     color: [255, 255, 255, 1],
                        //     colorMixMode: "replace"
                        // }
                    }]
                }
            });

            view.graphics.add(graphic);

        });

    //自动切换背景
    window.onload = function () {
        const imgs = ["Image/pict_000.jpg", "Image/pict_001.jpg", "Image/pict_002.jpg",
            "Image/pict_003.jpg", "Image/pict_004.jpg", "Image/pict_005.jpg", "Image/pict_006.jpg",
            "Image/pict_007.jpg", "Image/pict_008.jpg", "Image/pict_009.jpg", "Image/pict_010.jpg",
            "Image/pict_011.jpg", "Image/pict_012.jpg", "Image/pict_013.jpg"];
        const head = document.getElementById("image");
        const oriIndex = Math.floor(Math.random() * 14);
        head.style.background = "url(" + imgs[oriIndex] + ")";
        head.style.backgroundSize = "cover";

        function time() {
            const randomBgIndex = Math.floor(Math.random() * 14);
            head.style.background = "url(" + imgs[randomBgIndex] + ")";
            head.style.backgroundSize = "cover";
        }

        setInterval(time, 10000);
        document.getElementById("loading").style.display = "none";//去掉加载图
    }

    //按钮控制音乐，标注显示，归位
    const state = {
        music: false,
        label: false
    }
    const soundButton = document.getElementById("soundWidget");
    const labelButton = document.getElementById("labelWidget");
    const homeButton = document.getElementById("homeWidget");
    const compassButton = document.getElementById("compassWidget");
    const audioElement = new Audio("Sound/music.flac");
    audioElement.loop = true;
    soundButton.addEventListener("click", () => {
        state.music = !state.music;
        if (state.music) {
            audioElement.play();
        } else {
            audioElement.pause();
        }
    });
    labelButton.addEventListener("click", () => {
        state.label = !state.label;
        if (state.label) {
            geojsonlayer.labelsVisible = true;
            geoJSONLayer2D.labelsVisible = true;
        } else {
            geojsonlayer.labelsVisible = false;
            geoJSONLayer2D.labelsVisible = false;
        }
    });
    homeButton.addEventListener("click", () => {
        home.go();
    });
    compassButton.addEventListener("click", () => {
        view.goTo({
            heading:0
        })
    });

    //控制视窗
    const sideButton = document.getElementById("side");
    const button3D = document.getElementById("cube");
    const button23D = document.getElementById("rect");
    function control(opt) {
        if(opt === 0)
        {
            document.getElementById("sidePanelInfo").style.display = "block";
            document.getElementById("map").style.width = "70%";
        }
        else if(opt === 1)
        {
            document.getElementById("sidePanelInfo").style.display = "none";
            document.getElementById("map").style.width = "100%";
        }
        else if(opt === 2)
        {
            document.getElementById("viewDiv").style.width = "100%";
            document.getElementById("viewDiv2D").style.width = "0%";
        }
        else if(opt === 3)
        {
            document.getElementById("viewDiv").style.width = "50%";
            document.getElementById("viewDiv2D").style.width = "50%";
        }
    }
    const allvideo = document.querySelectorAll("video");
    sideButton.addEventListener("click", () => {
        let display = document.getElementById("sidePanelInfo").style.display;
        if (!(display === "none")) {
            control(1);
            allvideo.forEach((item)=>{
                item.pause();
            })
        } else {
            control(0);
        }
    });
    button3D.addEventListener("click",()=>{
        control(2)
    });
    button23D.addEventListener("click",()=>{
        control(3)
    })


    //视频加载，侧边栏联动图层
    let highlightSelect;

    view.whenLayerView(geojsonlayer).then((layerView) => {
        const queryPoints = geojsonlayer.createQuery();
        const buttons = document.querySelectorAll(".indicator");
        for (let i = 0, button = null; (button = buttons[i]); i++) {
            button.addEventListener("click", () => {
                queryPoints.where = "index = '" + i + "'";

                geojsonlayer.queryFeatures(queryPoints).then((result) => {
                    if (highlightSelect) {
                        highlightSelect.remove();
                    }
                    const feature = result.features[0];

                    if (document.getElementById(i.toString()).style.display === "block") {
                        document.getElementById(i.toString()).style.display = "none";
                        document.getElementById('v' + i).pause();
                    } else {
                        document.getElementById(i.toString()).style.display = "block";
                        document.getElementById('v' + i).play();
                        highlightSelect = layerView.highlight(
                            feature.attributes["OBJECTID"]//图层必须要有OBJECTID字段才行
                        );
                        view
                            .goTo(
                                {
                                    target: feature.geometry,
                                    tilt: 45,
                                    zoom: 16
                                },
                                {
                                    duration: 2000,
                                    easing: "in-out-expo"
                                }
                            )
                            .catch((error) => {
                                if (error.name != "AbortError") {
                                    console.error(error);
                                }
                            });
                    }
                });
            });
        }
    });

    //监听点击事件，图层联动侧边栏
    view.whenLayerView(geojsonlayer).then((layerView) => {
        view.on("immediate-click", (event) => {
            view.hitTest(event).then((response) => {
                console.log(response)
                candidate = response.results.find((result) => {
                    return (
                        result.graphic &&
                        result.graphic.layer &&
                        result.graphic.layer === geojsonlayer
                    );
                });

                if (highlightSelect) {
                    highlightSelect.remove();
                }
                if (candidate) {
                    control(0);
                    view
                        .goTo(
                            {
                                target: candidate.graphic.geometry,
                                tilt: 45,
                                zoom: 16
                            },
                            {
                                duration: 2000,
                                easing: "in-out-expo"
                            }
                        )
                        .catch((error) => {
                            if (error.name != "AbortError") {
                                console.error(error);
                            }
                        });

                    //console.log(candidate);
                    if (document.getElementById(candidate.graphic.attributes.index).style.display === "block") {
                        document.getElementById(candidate.graphic.attributes.index).style.display = "none";
                        document.getElementById('v' + candidate.graphic.attributes.index).pause();
                    } else {
                        highlightSelect = layerView.highlight(
                            candidate.graphic.attributes["OBJECTID"]//图层必须要有OBJECTID字段才行
                        );
                        document.getElementById(candidate.graphic.attributes.index).style.display = "block";
                        document.getElementById('0' + candidate.graphic.attributes.index).scrollIntoView();
                        document.getElementById('v' + candidate.graphic.attributes.index).play();
                    }
                }
            });
        });
    });

    //监听点击事件，图层联动侧边栏
    view2D.whenLayerView(geoJSONLayer2D).then((layerView) => {
        view2D.on("immediate-click", (event) => {
            view2D.hitTest(event).then((response) => {
                //console.log(response)
                candidate = response.results.find((result) => {
                    return (
                        result.graphic &&
                        result.graphic.layer &&
                        result.graphic.layer === geoJSONLayer2D
                    );
                });

                if (highlightSelect) {
                    highlightSelect.remove();
                }
                if (candidate) {
                    control(0);
                    view
                        .goTo(
                            {
                                target: candidate.graphic.geometry,
                                tilt: 45,
                                zoom: 16
                            },
                            {
                                duration: 2000,
                                easing: "in-out-expo"
                            }
                        )
                        .catch((error) => {
                            if (error.name != "AbortError") {
                                console.error(error);
                            }
                        });
                    if (document.getElementById(candidate.graphic.attributes.OBJECTID).style.display === "block") {
                        document.getElementById(candidate.graphic.attributes.OBJECTID).style.display = "none";
                        document.getElementById('v' + candidate.graphic.attributes.OBJECTID).pause();
                    } else {
                        highlightSelect = layerView.highlight(
                            candidate.graphic.attributes["OBJECTID"]//图层必须要有OBJECTID字段才行
                        );
                        document.getElementById(candidate.graphic.attributes.OBJECTID).style.display = "block";
                        document.getElementById('0' + candidate.graphic.attributes.OBJECTID).scrollIntoView();
                        document.getElementById('v' + candidate.graphic.attributes.OBJECTID).play();
                    }
                }
            });
        });
    });

    //同步两图层
    const views = [view2D, view];
    let active;

    const sync = (source) => {
        if (!active || !active.viewpoint || active !== source) {
            return;
        }

        for (const view of views) {
            if (view !== active) {
                view.viewpoint = active.viewpoint;
            }
        }
    };

    for (const view of views) {
        view.watch(["interacting", "animation"], () => {
            active = view;
            sync(active);
        });

        view.watch("viewpoint", () => sync(view));
    }
});