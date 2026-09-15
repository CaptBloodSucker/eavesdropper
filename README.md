System Architecture Overview

This setup is a safe, single-host simulation built in Node.js to demonstrate passive behavioral traffic analysis. It uses two local processes communicating over the loopback interface (127.0.0.1) via UDP to illustrate how network metadata (packet size and timing) reveals device state changes without inspecting payload contents.

1. Mock IoT Device (mock-device.js)

    Role: Simulates an unencrypted consumer smart device (such as a Wi-Fi motion camera or smart sensor).

    Behavior:

        Idle State: Emits small, fixed-size heartbeat packets (e.g., 32 bytes) at regular intervals to maintain connectivity.

        Active/Triggered State: Periodically toggles into a "motion detected" state, firing larger payload bursts (e.g., 1024 bytes) at a higher frequency to simulate event logging or media streaming.

    Transport: Sends UDP datagrams to 127.0.0.1 on port 1900.

2. Local Traffic Analyzer (analyzer.js)

    Role: Acts as a network monitor observing local traffic patterns.

    Behavior:

        Listens on port 1900 for incoming UDP datagrams.

        Logs the source address, port, packet size (msg.length), and arrival timestamps.

    Detection Mechanism: Calculates variations in byte count and packet frequency over time to flag state transitions (idle vs. active).

Core Concept Demonstrated

    Metadata Leakage: Even when payloads are encrypted or abstract, sudden spikes in packet size or frequency act as a side-channel signature.

    Eavesdropping Risk: Demonstrates why consumer hardware without packet padding or constant-rate transmission can leak physical activity patterns (like motion detection or device usage) to nearby network observers.
