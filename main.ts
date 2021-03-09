enum PingUnit {
    //% block="cm"
    Centimeters,
}


//% weight=0 color=#00BFFF icon="\uf2c4" block="Qcar"
namespace qcar {
    
    const modeRegister1 = 0x00 // MODE1
    const chipResolution = 4096;
    const modeRegister1Default = 0x01
    const sleep = modeRegister1Default | 0x10; // Set sleep bit to 1
    const wake = modeRegister1Default & 0xEF; // Set sleep bit to 0
    const restart = wake | 0x80; // Set restart bit to 1
    const PrescaleReg = 0xFE //the prescale register address
    const allChannelsOnStepLowByte = 0xFA // ALL_LED_ON_L
    const allChannelsOnStepHighByte = 0xFB // ALL_LED_ON_H
    const allChannelsOffStepLowByte = 0xFC // ALL_LED_OFF_L
    const allChannelsOffStepHighByte = 0xFD // ALL_LED_OFF_H

    function write(chipAddress: number, register: number, value: number): void {
        let data = ((register<<8)+value)
        pins.i2cWriteNumber(chipAddress, data, NumberFormat.Int16BE, false);
    }

    function calcFreqPrescaler(freq: number): number {
        return (25000000 / (freq * chipResolution)) - 1;
    }

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

    export enum Direction {
        //% blockId="Go_Foward" block="Go Foward"
        foward = 1,
        //% blockId="Go_Back" block="Go Back"
        back = 2,
        //% blockId="Turn_Left" block="Turn Left"
        left = 3,
        //% blockId="Turn_Right" block="Turn Right"
        right = 4,
        //% blockId="Stop" block="Stop"
        stop = 5
    }    
    
    export enum Dire {
        //% blockId="Forward" block="Forward"
        Forward = 0,
        //% blockId="Forward" block="Backward"
        Backward = 1
    }    
    export enum Motors {
        //% blockId="left motor" block="left"
        M1 = 0,
        //% blockId="right motor" block="right"
        M2 = 1,
    }
    

    /**
     * Read ultrasonic sensor.
     */

    //% blockId=ultrasonic_sensor block="read ultrasonic sensor |%unit "
    //% weight=10 group="1. Senser"
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
    //% group="1. Senser"
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
    * Enable IR LED.
    */

   //% blockId=IR_Enable block="Set the infrared status to |%irstatus"
   //% irstatus.fieldEditor="gridpicker" irstatus.fieldOptions.columns=2 
   //% weight=30 blockGap=8
    //% group="1. Senser"

   export function IREnable(IRstatus: irstatus): void {
       if (IRstatus == irstatus.iron) {
           pins.digitalWritePin(DigitalPin.P14, 1)
       } else if (IRstatus == irstatus.iroff) {
           pins.digitalWritePin(DigitalPin.P14, 0)
       } 
   }




    /**
     * Used to setup the chip, will cause the chip to do a full reset and turn off all outputs.\
     * @param freq [40-1000] Frequency (40-1000) in hertz to run the clock cycle at; eg: 50
     */
    //% weight=10 block group="2. Motor"
    export function initTheMotor() {
        const freq = 50
        const prescaler = calcFreqPrescaler(freq)

        write(0x40, modeRegister1, sleep)

        write(0x40, PrescaleReg, prescaler)

        write(0x40, allChannelsOnStepLowByte, 0x00)
        write(0x40, allChannelsOnStepHighByte, 0x00)
        write(0x40, allChannelsOffStepLowByte, 0x00)
        write(0x40, allChannelsOffStepHighByte, 0x00)

        write(0x40, modeRegister1, wake)

        control.waitMicros(1000)
        write(0x40, modeRegister1, restart)
    }

   /**
    * Stop the Q-Car
    */

   //% blockId=Stop_QCar block="Stop the Q-Car"
   //% weight=20 blockGap=8 group="2. Motor"

   export function Stop(): void {

    // Low byte of onStep
    write(0x40, 0x06, 0 & 0xFF)
    write(0x40, 0x07, (0 >> 8) & 0x0F)
    write(0x40, 0x08, 4095 & 0xFF)
    write(0x40, 0x09, (4095 >> 8) & 0x0F)
        
    write(0x40, 0x0A, 0 & 0xFF)
    write(0x40, 0x0B, (0 >> 8) & 0x0F)
    write(0x40, 0x0C, 4095 & 0xFF)
    write(0x40, 0x0D, (4095 >> 8) & 0x0F)

    write(0x40, 0x0E, 0 & 0xFF)
    write(0x40, 0x0E, (0 >> 8) & 0x0F)
    write(0x40, 0x10, 4095 & 0xFF)
    write(0x40, 0x11, (4095 >> 8) & 0x0F)

    write(0x40, 0x12, 0 & 0xFF)
    write(0x40, 0x13, (0 >> 8) & 0x0F)
    write(0x40, 0x14, 4095 & 0xFF)
    write(0x40, 0x15, (4095 >> 8) & 0x0F)
    } 


   /**
    * Contral The Q-Car.
    */

   //% blockId=Q-Car_Direction block="Let the Q-Car |%Direction"
   //% Direction.fieldEditor="gridpicker" Direction.fieldOptions.columns=5 
   //% weight=30 blockGap=8  group="2. Motor"

   export function QCar_Direction(Car_Direction: Direction): void {
        if (Car_Direction == Direction.foward) {
            write(0x40, 0x06, 0 & 0xFF)
            write(0x40, 0x07, (0 >> 8) & 0x0F)
            write(0x40, 0x08, 4095 & 0xFF)
            write(0x40, 0x09, (4095 >> 8) & 0x0F)
                
            write(0x40, 0x0A, 0 & 0xFF)
            write(0x40, 0x0B, (0 >> 8) & 0x0F)
            write(0x40, 0x0C, 0 & 0xFF)
            write(0x40, 0x0D, (0 >> 8) & 0x0F)

            write(0x40, 0x0E, 0 & 0xFF)
            write(0x40, 0x0F, (0 >> 8) & 0x0F)
            write(0x40, 0x10, 0 & 0xFF)
            write(0x40, 0x11, (0 >> 8) & 0x0F)

            write(0x40, 0x12, 0 & 0xFF)
            write(0x40, 0x13, (0 >> 8) & 0x0F)
            write(0x40, 0x14, 4095 & 0xFF)
            write(0x40, 0x15, (4095 >> 8) & 0x0F)
        } 
        else if (Car_Direction == Direction.back) {
            write(0x40, 0x06, 0 & 0xFF)
            write(0x40, 0x07, (0 >> 8) & 0x0F)
            write(0x40, 0x08, 0 & 0xFF)
            write(0x40, 0x09, (0 >> 8) & 0x0F)
            
            write(0x40, 0x0A, 0 & 0xFF)
            write(0x40, 0x0B, (0 >> 8) & 0x0F)
            write(0x40, 0x0C, 4095 & 0xFF)
            write(0x40, 0x0D, (4095 >> 8) & 0x0F)


            write(0x40, 0x0E, 0 & 0xFF)
            write(0x40, 0x0F, (0 >> 8) & 0x0F)
            write(0x40, 0x10, 4095 & 0xFF)
            write(0x40, 0x11, (4095 >> 8) & 0x0F)

            write(0x40, 0x12, 0 & 0xFF)
            write(0x40, 0x13, (0 >> 8) & 0x0F)
            write(0x40, 0x14, 0 & 0xFF)
            write(0x40, 0x15, (0  >> 8) & 0x0F)
        } 
        else if (Car_Direction == Direction.left) {

            write(0x40, 0x06, 0 & 0xFF)
            write(0x40, 0x07, (0 >> 8) & 0x0F)
            write(0x40, 0x08, 4095 & 0xFF)
            write(0x40, 0x09, (4095 >> 8) & 0x0F)
            
            write(0x40, 0x0A, 0 & 0xFF)
            write(0x40, 0x0B, (0 >> 8) & 0x0F)
            write(0x40, 0x0C, 0 & 0xFF)
            write(0x40, 0x0D, (0 >> 8) & 0x0F)


            write(0x40, 0x0E, 0 & 0xFF)
            write(0x40, 0x0F, (0 >> 8) & 0x0F)
            write(0x40, 0x10, 4095 & 0xFF)
            write(0x40, 0x11, (4095 >> 8) & 0x0F)

            write(0x40, 0x12, 0 & 0xFF)
            write(0x40, 0x13, (0 >> 8) & 0x0F)
            write(0x40, 0x14, 0 & 0xFF)
            write(0x40, 0x15, (0  >> 8) & 0x0F)
        
        } 
        else if (Car_Direction == Direction.right) {

            write(0x40, 0x06, 0 & 0xFF)
            write(0x40, 0x07, (0 >> 8) & 0x0F)
            write(0x40, 0x08, 0 & 0xFF)
            write(0x40, 0x09, (0 >> 8) & 0x0F)
            
            write(0x40, 0x0A, 0 & 0xFF)
            write(0x40, 0x0B, (0 >> 8) & 0x0F)
            write(0x40, 0x0C, 4095 & 0xFF)
            write(0x40, 0x0D, (4095 >> 8) & 0x0F)


            write(0x40, 0x0E, 0 & 0xFF)
            write(0x40, 0x0F, (0 >> 8) & 0x0F)
            write(0x40, 0x10, 0 & 0xFF)
            write(0x40, 0x11, (0 >> 8) & 0x0F)
    
            write(0x40, 0x12, 0 & 0xFF)
            write(0x40, 0x13, (0 >> 8) & 0x0F)
            write(0x40, 0x14, 4095 & 0xFF)
            write(0x40, 0x15, (4095 >> 8) & 0x0F)
        } 
        else if (Car_Direction == Direction.stop) {

            // Low byte of onStep
            write(0x40, 0x06, 0 & 0xFF)
            write(0x40, 0x07, (0 >> 8) & 0x0F)
            write(0x40, 0x08, 4095 & 0xFF)
            write(0x40, 0x09, (4095 >> 8) & 0x0F)
            
            write(0x40, 0x0A, 0 & 0xFF)
            write(0x40, 0x0B, (0 >> 8) & 0x0F)
            write(0x40, 0x0C, 4095 & 0xFF)
            write(0x40, 0x0D, (4095 >> 8) & 0x0F)
    
            write(0x40, 0x0E, 0 & 0xFF)
            write(0x40, 0x0F, (0 >> 8) & 0x0F)
            write(0x40, 0x10, 4095 & 0xFF)
            write(0x40, 0x11, (4095 >> 8) & 0x0F)
    
            write(0x40, 0x12, 0 & 0xFF)
            write(0x40, 0x13, (0 >> 8) & 0x0F)
            write(0x40, 0x14, 4095 & 0xFF)
            write(0x40, 0x15, (4095 >> 8) & 0x0F)
        } 
    }

    

        /**
     * Set the direction and speed of Maqueen motor.
     */

    //% weight=90
    //% blockId=motor_MotorRun block="motor|%index|move|%Dire|at speed|%speed"
    //% speed.min=0 speed.max=100
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2 
    //% weight=40 group="2. Motor"
    export function motorRun(index: Motors, direction: Dire, speed: number): void {
        let pulsetime = Math.map(speed, 0, 100, 0, 4095)
        if (index == 0) {
            if (direction == Dire.Forward) {
                write(0x40, 0x0E, 0 & 0xFF)
                write(0x40, 0x0F, (0 >> 8) & 0x0F)
                write(0x40, 0x10, 0 & 0xFF)
                write(0x40, 0x11, (0 >> 8) & 0x0F)
    
                write(0x40, 0x12, 0 & 0xFF)
                write(0x40, 0x13, (0 >> 8) & 0x0F)
                write(0x40, 0x14, pulsetime & 0xFF)
                write(0x40, 0x15, (pulsetime >> 8) & 0x0F)
            }
            if (direction == Dire.Backward) {
                write(0x40, 0x0E, 0 & 0xFF)
                write(0x40, 0x0F, (0 >> 8) & 0x0F)
                write(0x40, 0x10, pulsetime & 0xFF)
                write(0x40, 0x11, (pulsetime >> 8) & 0x0F)
    
                write(0x40, 0x12, 0 & 0xFF)
                write(0x40, 0x13, (0 >> 8) & 0x0F)
                write(0x40, 0x14, 0 & 0xFF)
                write(0x40, 0x15, (0  >> 8) & 0x0F)
            }
        }    
        
        if (index == 1) {
            if (direction == Dire.Forward) {
                write(0x40, 0x06, 0 & 0xFF)
                write(0x40, 0x07, (0 >> 8) & 0x0F)
                write(0x40, 0x08, pulsetime & 0xFF)
                write(0x40, 0x09, (pulsetime >> 8) & 0x0F)
                            
                write(0x40, 0x0A, 0 & 0xFF)
                write(0x40, 0x0B, (0 >> 8) & 0x0F)
                write(0x40, 0x0C, 0 & 0xFF)
                write(0x40, 0x0D, (0 >> 8) & 0x0F)
            }
            if (direction == Dire.Backward) {
                write(0x40, 0x06, 0 & 0xFF)
                write(0x40, 0x07, (0 >> 8) & 0x0F)
                write(0x40, 0x08, 0 & 0xFF)
                write(0x40, 0x09, (0 >> 8) & 0x0F)
                    
                write(0x40, 0x0A, 0 & 0xFF)
                write(0x40, 0x0B, (0 >> 8) & 0x0F)
                write(0x40, 0x0C, pulsetime & 0xFF)
                write(0x40, 0x0D, (pulsetime >> 8) & 0x0F)
            }
        }
    }
}