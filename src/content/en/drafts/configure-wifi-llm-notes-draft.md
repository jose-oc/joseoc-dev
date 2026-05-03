Setting up a clean, secure, and fast network on a brand new Mac is a great practice. macOS has excellent built-in networking tools, but a few tweaks will maximize your privacy, security, and speed.

Here is the recommended step-by-step guide to configuring your network, ordered from the most foundational to the most advanced.

---

### Step 1: Harden Your Wi-Fi Connection
Since you mentioned private Wi-Fi access, macOS has a fantastic but somewhat hidden feature for this.

**Enable "Private Wi-Fi Address" (MAC Randomization):**
By default, your Mac broadcasts a unique hardware identifier (MAC address) to every router it connects to. This allows places like airports, coffee shops, and malls to track your physical movement. 
1. Go to **System Settings > Wi-Fi**.
2. Click **Details** next to your connected network.
3. Ensure **Private Wi-Fi Address** is toggled **On**.
4. *Note: Do this for every network you save. If a network kicks you off after turning this on, it means the router uses outdated MAC filtering, and you can safely turn it back off for that specific network.*

### Step 2: Configure Modern, Private DNS
You have two main choices here: use an encrypted public DNS, or use your own VPN DNS (like the `100.100.1.1` Pi-hole we found earlier).

**Option A: Encrypted Public DNS (Best if you don't have a Pi-hole)**
Standard DNS is sent in plain text. Use DNS-over-HTTPS (DoH) to prevent your ISP from seeing your DNS requests.
1. Go to **System Settings > Network > Wi-Fi (or Ethernet) > Details > DNS**.
2. Delete any default ISPs listed under "DNS Servers".
3. Add your preferred encrypted DNS IPs:
   * **Cloudflare (Fast & Private):** `1.1.1.1` and `1.0.0.1`
   * **Quad9 (Secure & Blocks Malware):** `9.9.9.9` and `149.112.112.112`
4. *(Crucial Step)*: Right beneath the DNS server boxes is a dropdown menu that likely says "Default". Change it to **"Cloudflare, Inc."** or **"Quad9"**. This tells macOS to encrypt the connection to those IPs using HTTPS.

**Option B: Your VPN/Pi-hole DNS**
If you have a Wireguard/Tailscale setup with a Pi-hole (like your `100.100.1.1`), leave the macOS DNS settings on "Default". Instead, configure your VPN app to push those `100.x.x.x` DNS servers to the Mac when the VPN connects. This ensures you use your ad-blocker at home, but fall back to standard DNS when away from your VPN.

### Step 3: Configure Your SSH & VPN Clients (Clean Slate)
Since this is a new Mac, we want to make sure services like SSH and VPNs are properly sandboxed.

**Prevent SSH from hanging on bad networks:**
If you use SSH often (like connecting to your `raspi`), add this to your `~/.ssh/config` file. It prevents your terminal from freezing indefinitely if a server goes offline:
```text
Host *
  ServerAliveInterval 60
  ServerAliveCountMax 3
  AddKeysToAgent yes
  UseKeychain yes
```

**Fix macOS Firewall conflicts with VPNs:**
When you install VPN apps (like WireGuard, Tailscale, or ZeroTier), macOS often gets confused by conflicting firewalls. 
1. Go to **System Settings > Network > Firewall**.
2. Turn it **Off**.
3. Install and configure your VPN apps.
4. Turn the macOS Firewall back **On**, and click **Options...** ensure "Stealth Mode" is enabled.

### Step 4: Lock Down Background Network Access (Privacy)
macOS apps love to "phone home" in the background. You can stop this without installing any third-party software using a built-in terminal tool called `cfctl` (part of Apple's `NetworkExtension` framework).

1. Open your terminal.
2. Run `sudo cfctl` to see a list of built-in rules. 
3. You can block specific Apple telemetry (analytics) from reaching the internet by running commands like:
   ```bash
   sudo cfctl rule add block outgoing tcp any any app /System/Library/PrivateFrameworks/AssistantServices.framework/Versions/A/Support/assistantd
   ```
*(Note: If this feels too advanced, a highly respected, open-source GUI alternative for Mac is **LuLu** by Objective-See, which lets you click "Allow" or "Deny" whenever an app tries to connect for the first time).*

### Step 5: Enable "Lockdown Mode" (If you are a high-value target)
If you use this Mac for sensitive development work, journalism, or just want absolute maximum security:
1. Go to **System Settings > Privacy & Security**.
2. Scroll to the bottom and turn on **Lockdown Mode**.
3. *Warning:* This strictly limits what network features your Mac will use. It blocks incoming connection requests (even for things like AirDrop and local coding servers), strips images from web pages, and disables some SSH agent forwarding. Only use this if you value extreme security over convenience.

### Summary Checklist for a "Normal" Power User:
* [x] Wi-Fi Details -> Private Wi-Fi Address: **On**
* [x] DNS Servers set to `1.1.1.1`, `1.0.0.1` (or `9.9.9.9`) with the HTTPS dropdown selected.
* [x] macOS Firewall: **On** (with Stealth Mode).
* [x] `~/.ssh/config` updated with `ServerAliveInterval` and proper `IdentityFile` paths.
* [x] Leave the `100.100.1.1` DNS alone; let your VPN app manage it.


### Which Private Wi-Fi Address setting is better?

**Short answer:** Use **Rotating**. 

Here is the difference between the three:

*   **Off:** Your Mac uses its real, permanent hardware MAC address. This makes it incredibly easy for shops, airports, and advertisers to track exactly when you arrive, where you walk, and when you leave. *(Never use this unless a very old, locked-down corporate network forces you to).*
*   **Fixed:** Your Mac generates a *fake* MAC address the very first time it connects to this specific Wi-Fi network. It will use that exact same fake address every time you connect to *this specific network*. This stops cross-network tracking (so the airport can't link you to the coffee shop), but the airport still knows it's *you* returning to their network day after day.
*   **Rotating:** Your Mac generates a fake MAC address, but it changes it periodically (usually every few hours or days) while you are connected, and definitely changes it every time you disconnect and reconnect. 

**Why Rotating wins:**
It provides the highest level of privacy. It prevents both cross-network tracking (following you from place to place) AND longitudinal tracking (watching your habits over time in one specific place). 

*The only reason to use "Fixed" is if you are on a captive portal network (like a hotel Wi-Fi where you have to log in on a web page) and changing your MAC address forces you to re-agree to the terms of service constantly. For your home network, "Rotating" works flawlessly.*

---

### What is "Stealth Mode"? (Simple explanation)

Normally, when another computer or device on the internet "knocks" on your Mac's door to see if it's there, your Mac is programmed to be polite and yell back: *"Yes, I'm here!"* 

Even if your firewall is turned on and blocks the visitor from coming inside, your Mac still replies to their knock. Hackers use automated tools to knock on millions of doors. If they hear your Mac say "I'm here!", they make a note of your address and start trying to find a way to break in.

**Stealth Mode simply tells your Mac to ignore the knock entirely.** 

If a hacker or scanner knocks on your door while Stealth Mode is on, your Mac just stays completely silent. The hacker assumes nobody is home and moves on to the next target. It makes your Mac practically invisible to random internet scanners. 

*(Note: Stealth Mode does not affect normal browsing, downloading, or you actively connecting out to other computers. It only ignores random, unsolicited incoming "pings".)*

