export var hess_templates = [
    [
        {
            "components": [
                {
                    "curves": [
                        {
                            "curveColors": [
                                "#0d0c0c",
                                "#282525",
                                "#3be34e",
                                "#e43a3a"
                            ],
                            "curveNames": [
                                "HESS_GR",
                                "HESS_GR_LWD",
                                "FORMATION_PRESSURE_PSIA",
                                "CLUSTER"
                            ],
                            "curveStrokeDashArray": [
                                "solid",
                                "solid",
                                "solid",
                                "solid"
                            ],
                            "curveUnits": [
                                "",
                                "",
                                "",
                                ""
                            ],
                            "dataType": "curve",
                            "depthCurveName": "DEPTH",
                            "depthUnit": "m",
                            "fill": [
                                {
                                    "curve2": "HESS_GR",
                                    "curveName": "HESS_GR",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "interpolator",
                                        "RGBA(0,0,0, 0.25)",
                                        "RGBA(255,255,255, 0.55)"
                                    ],
                                    "fillDirection": "right",
                                    "colorInterpolator": [
                                        "interpolateSpectral",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "200",
                                    "minScaleX": "0"
                                },
                                {
                                    "curve2": "FORMATION_PRESSURE_PSIA",
                                    "curveName": "HESS_GR_LWD",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "interpolator",
                                        "RGBA(0,0,0, 0.25)",
                                        "RGBA(255,255,255, 0.55)"
                                    ],
                                    "fillDirection": "right",
                                    "colorInterpolator": [
                                        "interpolateViridis",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "200",
                                    "minScaleX": "0"
                                },
                                {
                                    "curve2": "CLUSTER",
                                    "curveName": "FORMATION_PRESSURE_PSIA",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "interpolator",
                                        "RGBA(0,0,0, 0.25)",
                                        "RGBA(255,255,255, 0.55)"
                                    ],
                                    "fillDirection": "right",
                                    "colorInterpolator": [
                                        "interpolateSpectral",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "",
                                    "minScaleX": ""
                                },
                                {
                                    "curve2": "CLUSTER",
                                    "curveName": "FORMATION_PRESSURE_PSIA",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#4caf50",
                                        "#087f23",
                                        "#80e27e"
                                    ],
                                    "fillDirection": "right",
                                    "colorInterpolator": [
                                        "green",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "-1",
                                    "minScaleX": "21"
                                }
                            ],
                            "scaleTypeLinearLog": [
                                "linear",
                                "linear",
                                "linear",
                                "linear"
                            ],
                            "strokeLinecap": [
                                "butt",
                                "butt",
                                "butt",
                                "butt"
                            ],
                            "strokeWidth": [
                                "0.5",
                                "0.5",
                                "0.5",
                                "2"
                            ],
                            "wellNames": [
                                "1",
                                "1",
                                "1",
                                "1"
                            ]
                        }
                    ]
                }
            ],
            "trackBox": {
                "width": 150.36363636363637,
                "height": 1269,
                "div_id": "well_holder_track_0",
                "margin": {
                    "top": 5,
                    "right": 10,
                    "bottom": 5,
                    "left": 60
                }
            }
        }
    ],
    [
        {
            "components": [
                {
                    "curves": [
                        {
                            "curveColors": [
                                "#141414",
                                "#f25454"
                            ],
                            "curveNames": [
                                "HESS_RES_DEEP",
                                "CLUSTER"
                            ],
                            "curveStrokeDashArray": [
                                "solid",
                                "solid"
                            ],
                            "curveUnits": [
                                "",
                                ""
                            ],
                            "dataType": "curve",
                            "depthCurveName": "DEPTH",
                            "depthUnit": "m",
                            "fill": [
                                {
                                    "curve2": "CLUSTER",
                                    "curveName": "HESS_RES_DEEP",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "yes",
                                    "fillColors": [
                                        "#4caf50",
                                        "#087f23",
                                        "#80e27e"
                                    ],
                                    "fillDirection": "left",
                                    "colorInterpolator": [
                                        "green",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "200",
                                    "minScaleX": "0.2"
                                },
                                {
                                    "curve2": "CLUSTER",
                                    "curveName": "HESS_RES_DEEP",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#4caf50",
                                        "#087f23",
                                        "#80e27e"
                                    ],
                                    "fillDirection": "left",
                                    "colorInterpolator": [
                                        "green",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "-1",
                                    "minScaleX": "21"
                                }
                            ],
                            "scaleTypeLinearLog": [
                                "log",
                                "linear"
                            ],
                            "strokeLinecap": [
                                "butt",
                                "butt"
                            ],
                            "strokeWidth": [
                                "0.5",
                                "2"
                            ],
                            "wellNames": [
                                "1",
                                "1"
                            ]
                        }
                    ]
                }
            ],
            "trackBox": {
                "width": 150.36363636363637,
                "height": 1269,
                "div_id": "well_holder_track_2",
                "margin": {
                    "top": 5,
                    "right": 10,
                    "bottom": 5,
                    "left": 60
                }
            }
        }
    ],
    [
        {
            "components": [
                {
                    "curves": [
                        {
                            "curveColors": [
                                "#e22828",
                                "#3247e7",
                                "#e22828"
                            ],
                            "curveNames": [
                                "HESS_RHOB_G_PER_CM3",
                                "HESS_NPHI_SS",
                                "CLUSTER"
                            ],
                            "curveStrokeDashArray": [
                                "solid",
                                "solid",
                                "solid"
                            ],
                            "curveUnits": [
                                "",
                                "",
                                ""
                            ],
                            "dataType": "curve",
                            "depthCurveName": "DEPTH",
                            "depthUnit": "m",
                            "fill": [
                                {
                                    "curve2": "HESS_NPHI_SS",
                                    "curveName": "HESS_RHOB_G_PER_CM3",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#ffeb3b",
                                        "#c8b900",
                                        "#ffff72"
                                    ],
                                    "fillDirection": "right",
                                    "colorInterpolator": [
                                        "yellow",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "2.65",
                                    "minScaleX": "1.65"
                                },
                                {
                                    "curve2": "HESS_NPHI_SS",
                                    "curveName": "HESS_RHOB_G_PER_CM3",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "interpolator",
                                        "RGBA(0,0,0, 0.25)",
                                        "RGBA(255,255,255, 0.55)"
                                    ],
                                    "fillDirection": "between",
                                    "colorInterpolator": [
                                        "interpolateViridis",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "0",
                                    "minScaleX": "0.6"
                                },
                                {
                                    "curve2": "CLUSTER",
                                    "curveName": "HESS_NPHI_SS_M3_PER_M3",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#ffeb3b",
                                        "#c8b900",
                                        "#ffff72"
                                    ],
                                    "fillDirection": "between",
                                    "colorInterpolator": [
                                        "yellow",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "-1",
                                    "minScaleX": "21"
                                }
                            ],
                            "scaleTypeLinearLog": [
                                "linear",
                                "linear",
                                "linear"
                            ],
                            "strokeLinecap": [
                                "butt",
                                "butt",
                                "butt"
                            ],
                            "strokeWidth": [
                                "1",
                                "1",
                                "2"
                            ],
                            "wellNames": [
                                "1",
                                "1",
                                "1"
                            ]
                        }
                    ]
                }
            ],
            "trackBox": {
                "width": 150.36363636363637,
                "height": 1269,
                "div_id": "well_holder_track_3",
                "margin": {
                    "top": 5,
                    "right": 10,
                    "bottom": 5,
                    "left": 60
                }
            }
        }
    ],
    [
        {
            "components": [
                {
                    "curves": [
                        {
                            "curveColors": [
                                "#1a1919",
                                "#712dd7",
                                "#69ece4",
                                "#e44949"
                            ],
                            "curveNames": [
                                "HESS_DTC_US_PER_FT",
                                "HESS_DTS_FAST_US_PER_FT",
                                "HESS_WCLC1",
                                "CLUSTER"
                            ],
                            "curveStrokeDashArray": [
                                "solid",
                                "solid",
                                "solid",
                                "solid"
                            ],
                            "curveUnits": [
                                "",
                                "",
                                "",
                                ""
                            ],
                            "dataType": "curve",
                            "depthCurveName": "DEPTH",
                            "depthUnit": "m",
                            "fill": [
                                {
                                    "curve2": "HESS_DTC_US_PER_FT",
                                    "curveName": "HESS_DTC_US_PER_FT",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#ffeb3b",
                                        "#c8b900",
                                        "#ffff72"
                                    ],
                                    "fillDirection": "left",
                                    "colorInterpolator": [
                                        "yellow",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "40",
                                    "minScaleX": "140"
                                },
                                {
                                    "curve2": "HESS_WCLC1",
                                    "curveName": "HESS_DTS_FAST_US_PER_FT",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#ffeb3b",
                                        "#c8b900",
                                        "#ffff72"
                                    ],
                                    "fillDirection": "right",
                                    "colorInterpolator": [
                                        "yellow",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "100",
                                    "minScaleX": "400"
                                },
                                {
                                    "curve2": "CLUSTER",
                                    "curveName": "HESS_WCLC1",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "interpolator",
                                        "RGBA(0,0,0, 0.25)",
                                        "RGBA(255,255,255, 0.55)"
                                    ],
                                    "fillDirection": "between",
                                    "colorInterpolator": [
                                        "interpolateRdBu",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "1",
                                    "minScaleX": "0"
                                },
                                {
                                    "curve2": "CLUSTER",
                                    "curveName": "HESS_WCLC1",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#ffeb3b",
                                        "#c8b900",
                                        "#ffff72"
                                    ],
                                    "fillDirection": "left",
                                    "colorInterpolator": [
                                        "yellow",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "-1",
                                    "minScaleX": "21"
                                }
                            ],
                            "scaleTypeLinearLog": [
                                "linear",
                                "linear",
                                "linear",
                                "linear"
                            ],
                            "strokeLinecap": [
                                "butt",
                                "butt",
                                "butt",
                                "butt"
                            ],
                            "strokeWidth": [
                                "1",
                                "1",
                                "0.5",
                                "2"
                            ],
                            "wellNames": [
                                "1",
                                "1",
                                "1",
                                "1"
                            ]
                        }
                    ]
                }
            ],
            "trackBox": {
                "width": 150.36363636363637,
                "height": 1269,
                "div_id": "well_holder_track_4",
                "margin": {
                    "top": 5,
                    "right": 10,
                    "bottom": 5,
                    "left": 60
                }
            }
        }
    ],
    [
        {
            "components": [
                {
                    "curves": [
                        {
                            "curveColors": [
                                "#d53f3f",
                                "#171616",
                                "#e55252"
                            ],
                            "curveNames": [
                                "CLUSTER",
                                "HESS_VSH",
                                "SEALS"
                            ],
                            "curveStrokeDashArray": [
                                "solid",
                                "solid",
                                "solid"
                            ],
                            "curveUnits": [
                                "",
                                "",
                                ""
                            ],
                            "dataType": "curve",
                            "depthCurveName": "DEPTH",
                            "depthUnit": "m",
                            "fill": [
                                {
                                    "curve2": "CLUSTER",
                                    "curveName": "CLUSTER",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#ffeb3b",
                                        "#c8b900",
                                        "#ffff72"
                                    ],
                                    "fillDirection": "right",
                                    "colorInterpolator": [
                                        "yellow",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "-1",
                                    "minScaleX": "21"
                                },
                                {
                                    "curve2": "SEALS",
                                    "curveName": "HESS_VSH",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#212121",
                                        "#000000",
                                        "#484848"
                                    ],
                                    "fillDirection": "left",
                                    "colorInterpolator": [
                                        "black",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "1",
                                    "minScaleX": "0"
                                },
                                {
                                    "curve2": "SEALS",
                                    "curveName": "HESS_VSH",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#ffeb3b",
                                        "#c8b900",
                                        "#ffff72"
                                    ],
                                    "fillDirection": "right",
                                    "colorInterpolator": [
                                        "yellow",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "21",
                                    "minScaleX": "0"
                                }
                            ],
                            "scaleTypeLinearLog": [
                                "linear",
                                "linear",
                                "linear"
                            ],
                            "strokeLinecap": [
                                "butt",
                                "butt",
                                "butt"
                            ],
                            "strokeWidth": [
                                "2",
                                "1",
                                "1"
                            ],
                            "wellNames": [
                                "1",
                                "1",
                                "1"
                            ]
                        }
                    ]
                }
            ],
            "trackBox": {
                "width": 150.36363636363637,
                "height": 1269,
                "div_id": "well_holder_track_5",
                "margin": {
                    "top": 5,
                    "right": 10,
                    "bottom": 5,
                    "left": 60
                }
            }
        }
    ],
    [
        {
            "components": [
                {
                    "curves": [
                        {
                            "curveColors": [
                                "#f20d0d",
                                "#7c32ec",
                                "#49e453"
                            ],
                            "curveNames": [
                                "CLUSTER",
                                "HESS_KHK",
                                "HESS_SW"
                            ],
                            "curveStrokeDashArray": [
                                "solid",
                                "solid",
                                "solid"
                            ],
                            "curveUnits": [
                                "",
                                "",
                                ""
                            ],
                            "dataType": "curve",
                            "depthCurveName": "DEPTH",
                            "depthUnit": "m",
                            "fill": [
                                {
                                    "curve2": "CLUSTER",
                                    "curveName": "CLUSTER",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#212121",
                                        "#000000",
                                        "#484848"
                                    ],
                                    "fillDirection": "left",
                                    "colorInterpolator": [
                                        "black",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "-1",
                                    "minScaleX": "21"
                                },
                                {
                                    "curve2": "HESS_SW",
                                    "curveName": "HESS_KHK",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#4caf50",
                                        "#087f23",
                                        "#80e27e"
                                    ],
                                    "fillDirection": "left",
                                    "colorInterpolator": [
                                        "green",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "100000",
                                    "minScaleX": "0"
                                },
                                {
                                    "curve2": "HESS_SW",
                                    "curveName": "HESS_KHK",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "yes",
                                    "fillColors": [
                                        "#4caf50",
                                        "#087f23",
                                        "#80e27e"
                                    ],
                                    "fillDirection": "left",
                                    "colorInterpolator": [
                                        "green",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "0",
                                    "minScaleX": "1"
                                }
                            ],
                            "scaleTypeLinearLog": [
                                "linear",
                                "linear",
                                "linear"
                            ],
                            "strokeLinecap": [
                                "butt",
                                "butt",
                                "butt"
                            ],
                            "strokeWidth": [
                                "2",
                                "1",
                                "2"
                            ],
                            "wellNames": [
                                "1",
                                "1",
                                "1"
                            ]
                        }
                    ]
                }
            ],
            "trackBox": {
                "width": 150.36363636363637,
                "height": 1269,
                "div_id": "well_holder_track_6",
                "margin": {
                    "top": 5,
                    "right": 10,
                    "bottom": 5,
                    "left": 60
                }
            }
        }
    ],
    [
        {
            "components": [
                {
                    "curves": [
                        {
                            "curveColors": [
                                "#171616",
                                "#171616",
                                "#1c1d1b"
                            ],
                            "curveNames": [
                                "HESS_BVW",
                                "HESS_PHIE",
                                "HESS_BVW"
                            ],
                            "curveStrokeDashArray": [
                                "solid",
                                "solid",
                                "solid"
                            ],
                            "curveUnits": [
                                "",
                                "",
                                ""
                            ],
                            "dataType": "curve",
                            "depthCurveName": "DEPTH",
                            "depthUnit": "m",
                            "fill": [
                                {
                                    "curve2": "HESS_PHIE",
                                    "curveName": "HESS_BVW",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "yes",
                                    "fillColors": [
                                        "#3f51b5",
                                        "#002984",
                                        "#757de8"
                                    ],
                                    "fillDirection": "right",
                                    "colorInterpolator": [
                                        "blue",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "0",
                                    "minScaleX": "0.3"
                                },
                                {
                                    "curve2": "HESS_BVW",
                                    "curveName": "HESS_PHIE",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "yes",
                                    "fillColors": [
                                        "#4caf50",
                                        "#087f23",
                                        "#80e27e"
                                    ],
                                    "fillDirection": "between",
                                    "colorInterpolator": [
                                        "green",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "0",
                                    "minScaleX": "0.3"
                                },
                                {
                                    "curve2": "HESS_PHIE",
                                    "curveName": "HESS_BVW",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "yes",
                                    "fillColors": [
                                        "#4caf50",
                                        "#087f23",
                                        "#80e27e"
                                    ],
                                    "fillDirection": "between",
                                    "colorInterpolator": [
                                        "green",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "0",
                                    "minScaleX": "0.3"
                                }
                            ],
                            "scaleTypeLinearLog": [
                                "linear",
                                "linear",
                                "linear"
                            ],
                            "strokeLinecap": [
                                "butt",
                                "butt",
                                "butt"
                            ],
                            "strokeWidth": [
                                "1",
                                "1",
                                "1"
                            ],
                            "wellNames": [
                                "1",
                                "1",
                                "1"
                            ]
                        }
                    ]
                }
            ],
            "trackBox": {
                "width": 150.36363636363637,
                "height": 1269,
                "div_id": "well_holder_track_7",
                "margin": {
                    "top": 5,
                    "right": 10,
                    "bottom": 5,
                    "left": 60
                }
            }
        }
    ],
    [
        {
            "components": [
                {
                    "curves": [
                        {
                            "curveColors": [
                                "#dd2727",
                                "#5134df",
                                "#e4ad4e",
                                "#d1cccc",
                                "#67ec55",
                                "#ee5353"
                            ],
                            "curveNames": [
                                "HESS_WQFM1",
                                "HESS_WPYR1",
                                "HESS_WCLC1",
                                "HESS_WCLA",
                                "FORMATION_PRESSURE_PSIA",
                                "CLUSTER"
                            ],
                            "curveStrokeDashArray": [
                                "2,2",
                                "2,2",
                                "2,2",
                                "2,2",
                                "solid",
                                "solid"
                            ],
                            "curveUnits": [
                                "",
                                "",
                                "",
                                "",
                                "",
                                ""
                            ],
                            "dataType": "curve",
                            "depthCurveName": "DEPTH",
                            "depthUnit": "m",
                            "fill": [
                                {
                                    "curve2": "HESS_WPYR1",
                                    "curveName": "HESS_WQFM1",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#ffeb3b",
                                        "#c8b900",
                                        "#ffff72"
                                    ],
                                    "fillDirection": "right",
                                    "colorInterpolator": [
                                        "yellow",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "1",
                                    "minScaleX": "0"
                                },
                                {
                                    "curve2": "HESS_WCLC1",
                                    "curveName": "HESS_WPYR1",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#3f51b5",
                                        "#002984",
                                        "#757de8"
                                    ],
                                    "fillDirection": "between",
                                    "colorInterpolator": [
                                        "blue",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "1",
                                    "minScaleX": "0"
                                },
                                {
                                    "curve2": "HESS_WCLA",
                                    "curveName": "HESS_WCLC1",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#f44336",
                                        "#ba000d",
                                        "#ff7961"
                                    ],
                                    "fillDirection": "between",
                                    "colorInterpolator": [
                                        "red",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "1",
                                    "minScaleX": "0"
                                },
                                {
                                    "curve2": "FORMATION_PRESSURE_PSIA",
                                    "curveName": "HESS_WCLA",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#212121",
                                        "#000000",
                                        "#484848"
                                    ],
                                    "fillDirection": "between",
                                    "colorInterpolator": [
                                        "black",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "1",
                                    "minScaleX": "0"
                                },
                                {
                                    "curve2": "CLUSTER",
                                    "curveName": "FORMATION_PRESSURE_PSIA",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#4caf50",
                                        "#087f23",
                                        "#80e27e"
                                    ],
                                    "fillDirection": "right",
                                    "colorInterpolator": [
                                        "green",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "",
                                    "minScaleX": ""
                                },
                                {
                                    "curve2": "CLUSTER",
                                    "curveName": "FORMATION_PRESSURE_PSIA",
                                    "cutoffs": [
                                        -99999999,
                                        "",
                                        ""
                                    ],
                                    "fill": "no",
                                    "fillColors": [
                                        "#ffeb3b",
                                        "#c8b900",
                                        "#ffff72"
                                    ],
                                    "fillDirection": "right",
                                    "colorInterpolator": [
                                        "yellow",
                                        null,
                                        null
                                    ],
                                    "maxScaleX": "-1",
                                    "minScaleX": "21"
                                }
                            ],
                            "scaleTypeLinearLog": [
                                "linear",
                                "linear",
                                "linear",
                                "linear",
                                "linear",
                                "linear"
                            ],
                            "strokeLinecap": [
                                "butt",
                                "butt",
                                "butt",
                                "butt",
                                "butt",
                                "butt"
                            ],
                            "strokeWidth": [
                                "2",
                                "2",
                                "2",
                                "2",
                                "2",
                                "2"
                            ],
                            "wellNames": [
                                "1",
                                "1",
                                "1",
                                "1",
                                "1",
                                "1"
                            ]
                        }
                    ]
                }
            ],
            "trackBox": {
                "width": 150.36363636363637,
                "height": 1269,
                "div_id": "well_holder_track_8",
                "margin": {
                    "top": 5,
                    "right": 10,
                    "bottom": 5,
                    "left": 60
                }
            }
        }
    ]
]