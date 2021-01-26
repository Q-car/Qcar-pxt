
let qcarparam = 0
let qcarparam1 = 1
enum PingUnit {
    //% block="cm"
    Centimeters,
}


//% weight=0 color=#00BFFF icon="\uf2c4" block="Qcar"
namespace qcar {

    export enum Patrol {
        //% blockId="patrolLeft" block="left"
        PatrolLeft = 2,
        //% blockId="patrolRight" block="right"
        PatrolRight = 1
    }

    export enum irstatus {
        //% blockId="iron" block="on"
        iron = 1,
        //% blockId="iroff" block="off"
        iroff = 2
    }

    /**
     * Read ultrasonic sensor.
     */

    //% blockId=ultrasonic_sensor block="read ultrasonic sensor |%unit "
    //% weight=95
    export function Ultrasonic(unit: PingUnit, maxCmDistance = 500): number {
        let d
        pins.digitalWritePin(DigitalPin.P12, 1);
        basic.pause(1)
        pins.digitalWritePin(DigitalPin.P12, 0);
        if (pins.digitalReadPin(DigitalPin.P13) == 0) {
            pins.digitalWritePin(DigitalPin.P12, 0);
            //sleep_us(2);
            pins.digitalWritePin(DigitalPin.P12, 1);
            //sleep_us(10);
            pins.digitalWritePin(DigitalPin.P12, 0);
            d = pins.pulseIn(DigitalPin.P13, PulseValue.High, maxCmDistance * 58);//readPulseIn(1);
        } else {
            pins.digitalWritePin(DigitalPin.P12, 0);
            pins.digitalWritePin(DigitalPin.P12, 1);
            d = pins.pulseIn(DigitalPin.P13, PulseValue.Low, maxCmDistance * 58);//readPulseIn(0);
        }
        let x = d / 39;
        if (x <= 0 || x > 500) {
            return 0;
        }
        switch (unit) {
            case PingUnit.Centimeters: return Math.round(x);
            default: return Math.idiv(d, 2.54);
        }

    }


     /**
     * Read line tracking sensor.
     */

    //% weight=20
    //% blockId=read_Patrol block="read |%patrol line tracking sensor"
    //% patrol.fieldEditor="gridpicker" patrol.fieldOptions.columns=2 
    export function readPatrol(patrol: Patrol): number {
        if (patrol == Patrol.PatrolLeft) {
            return pins.analogReadPin(AnalogPin.P2)
        } else if (patrol == Patrol.PatrolRight) {
            return pins.analogReadPin(AnalogPin.P1)
        } else {
            return -1
        }
    }


    /**
     * Turn on/off the LEDs.
     */

    //% weight=20
    //% blockId=writeLED block="LEDlight |%led turn |%ledswitch"
    //% led.fieldEditor="gridpicker" led.fieldOptions.columns=2 
    //% ledswitch.fieldEditor="gridpicker" ledswitch.fieldOptions.columns=2
    export function writeLED(led: LED, ledswitch: LEDswitch): void {
        if (led == LED.LEDLeft) {
            pins.digitalWritePin(DigitalPin.P8, ledswitch)
        } else if (led == LED.LEDRight) {
            pins.digitalWritePin(DigitalPin.P12, ledswitch)
        } else {
            return
        }
    }

    /**
     * Turn high power outputs on and off
     * @param pin which high power output pin to control
     * @param output is the boolean output of the pin, either ON or OFF
     * @param power is an optional parameter to set the power output for the pin eg: 100
     */
    //% subcategory="Inputs/Outputs"
    //% blockId=kitronik_environmental_board_high_power_on_off 
    //% block="turn high power %output=on_off_toggle
    //% expandableArgumentMode="toggle"
    //% weight=80 blockGap=8
    export function irstatus(output: boolean,): void {
        if (output == true) {
            pins.digitalWritePin(DigitalPin.P14, 1)
        }
        else {
            pins.digitalWritePin(DigitalPin.P14, 0)
        }
        
    }

}