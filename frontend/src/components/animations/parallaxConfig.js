import { Shape } from "@tsparticles/engine";

export const parallaxConfig = {
    background:{
        color:{value:"transparent"}
    },
    particles:{
        number: {value:70},
        move: {
            enable:true,
            speed:1,
            outModes:{default:"out"}
        },
        interactivity: {
            events: {
                onHover: {
                    enable:true,
                    mode:"parallax"
                }
            },
            modes:{
                parallax:{
                    enable:true,
                    force:50,
                    smooth:10
                },
            }
        },
        shape:{
            type:"circle",
        },
        size:{
            value:{
                min:3,
                max:5
            }
        },
        color: {
            value: "#c8b9ff"
        },
        links:{
            enable:true,
            color:"#c8b9ff",
            distance:150,
            width:1
        }
    }
};