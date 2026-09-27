import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, init_db
from app.core.security import hash_password
from app.models.user import User, Role
from app.models.jurisdiction import Department, District, PoliceStation
from app.models.camera import Camera, CameraHealth
from app.models.event import CameraEvent, VehicleDetection, ANPRDetection
from app.models.watchlist import Watchlist, WatchlistVehicle
from app.models.alert import Alert
from app.models.investigation import Investigation, InvestigationEvidence, InvestigationNote
from app.core.logging import logger

async def seed_data():
    await init_db()
    async with AsyncSessionLocal() as db:
        # Check if already seeded
        check_role = await db.execute(select(Role).limit(1))
        if check_role.scalar_one_or_none():
            logger.info("Database already contains data. Skipping initial seeding.")
            return

        logger.info("Starting SentinelX Master Seeding...")

        # 1. ROLES
        roles_data = [
            ("Super Admin", "Full statewide administrative authority"),
            ("State Admin", "State level monitoring and analytics access"),
            ("District Admin", "District level jurisdiction management"),
            ("Investigator", "Vehicle tracking, journey reconstruction, and case workspace"),
            ("Operator", "Live CCTV monitoring and alert response"),
            ("Auditor", "Read-only access to audit trails and compliance reports"),
        ]
        roles_map = {}
        for name, desc in roles_data:
            role = Role(name=name, description=desc)
            db.add(role)
            await db.flush()
            roles_map[name] = role.id

        # 2. USERS
        users_data = [
            ("admin", "admin@sentinelx.gujarat.gov.in", "Director General (Tech)", roles_map["Super Admin"], "GJ-POL-001"),
            ("investigator", "patel.vk@sentinelx.gujarat.gov.in", "Inspector V. K. Patel", roles_map["Investigator"], "GJ-INV-402"),
            ("operator", "operator1@sentinelx.gujarat.gov.in", "Head Operator Rathod", roles_map["Operator"], "GJ-OP-112"),
            ("auditor", "auditor@vigilance.gujarat.gov.in", "Auditor S. K. Joshi", roles_map["Auditor"], "GJ-AUD-009"),
        ]
        user_objs = {}
        for username, email, full_name, role_id, badge in users_data:
            user = User(
                username=username,
                email=email,
                full_name=full_name,
                hashed_password=hash_password("SentinelX@2026"),
                badge_number=badge,
                department="Gujarat Police State Command Center",
                role_id=role_id,
                is_active=True,
            )
            db.add(user)
            await db.flush()
            user_objs[username] = user

        # 3. DEPARTMENTS
        dept_home = Department(code="POLICE", name="Gujarat Police (Home Dept)", description="Statewide law enforcement")
        dept_traffic = Department(code="TRAFFIC", name="Gujarat Traffic Police", description="Highway & Urban Traffic Management")
        dept_smartcity = Department(code="SMARTCITY", name="Gujarat Smart Cities Mission", description="Municipal surveillance cameras")
        db.add_all([dept_home, dept_traffic, dept_smartcity])
        await db.flush()

        # 4. DISTRICTS
        districts_info = [
            ("AHM", "Ahmedabad", 23.0225, 72.5714),
            ("GND", "Gandhinagar", 23.2156, 72.6369),
            ("SRT", "Surat", 21.1702, 72.8311),
            ("BRD", "Vadodara", 22.3072, 73.1812),
            ("RJK", "Rajkot", 22.3039, 70.8022),
            ("BHV", "Bhavnagar", 21.7645, 72.1519),
            ("JMN", "Jamnagar", 22.4707, 70.0577),
            ("KTC", "Kutch", 23.2420, 69.6669),
        ]
        district_map = {}
        for code, name, lat, lng in districts_info:
            d = District(code=code, name=name, state="Gujarat", center_lat=lat, center_lng=lng)
            db.add(d)
            await db.flush()
            district_map[code] = d

        # 5. POLICE STATIONS
        ps_vastrapur = PoliceStation(district_id=district_map["AHM"].id, code="PS-VAST", name="Vastrapur Police Station", latitude=23.0365, longitude=72.5284)
        ps_bodakdev = PoliceStation(district_id=district_map["AHM"].id, code="PS-BODK", name="Bodakdev Police Station", latitude=23.0441, longitude=72.5186)
        ps_infocity = PoliceStation(district_id=district_map["GND"].id, code="PS-INFO", name="Infocity Police Station", latitude=23.1932, longitude=72.6315)
        ps_sector7 = PoliceStation(district_id=district_map["GND"].id, code="PS-SEC7", name="Sector 7 Police Station", latitude=23.2201, longitude=72.6512)
        ps_varachha = PoliceStation(district_id=district_map["SRT"].id, code="PS-VARA", name="Varachha Police Station", latitude=21.2144, longitude=72.8584)
        db.add_all([ps_vastrapur, ps_bodakdev, ps_infocity, ps_sector7, ps_varachha])
        await db.flush()

        # 6. 50 HETEROGENEOUS CAMERAS ACROSS GUJARAT
        # Coordinates aligned realistically along key Gujarat transit corridors (SG Highway -> Gandhinagar, Surat, Vadodara, Rajkot)
        cameras_metadata = [
            # AHMEDABAD (20 cameras)
            ("CAM-AHM-001", "SG Hwy - Iscon Crossroad Junction", "AHM", ps_vastrapur.id, 23.0278, 72.5074, "Hikvision", "DS-2CD7A26G0/P", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm001", "1080p", 30, True, True, "ONLINE"),
            ("CAM-AHM-002", "SG Hwy - Karnavati Club Entry", "AHM", ps_vastrapur.id, 23.0182, 72.5031, "Dahua", "DH-IPC-HFW5442", "Genetec Omnicast", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm002", "1080p", 25, False, True, "ONLINE"),
            ("CAM-AHM-003", "SG Hwy - Rajpath Club Chowk", "AHM", ps_bodakdev.id, 23.0360, 72.5115, "Axis", "Q1656-LE", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm003", "4K", 30, True, True, "ONLINE"),
            ("CAM-AHM-004", "SG Hwy - Pakwan Dining Junction", "AHM", ps_bodakdev.id, 23.0442, 72.5173, "CP Plus", "CP-UNC-TA41ZL", "HikCentral", "HLS", "https://gateway.sentinelx.local/hls/ahm004.m3u8", "1080p", 25, False, True, "ONLINE"),
            ("CAM-AHM-005", "Sindhu Bhavan Rd - Prime Junction", "AHM", ps_bodakdev.id, 23.0425, 72.5050, "Hikvision", "iDS-2CD7A46G0/P", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm005", "1080p", 30, True, True, "ONLINE"),
            ("CAM-AHM-006", "SG Hwy - Gulmohar Park Flyover", "AHM", ps_vastrapur.id, 23.0230, 72.5089, "Matrix", "SATATYA CIDR50", "Matrix SATATYA", "ONVIF", "onvif://gateway.sentinelx.local/onvif/ahm006", "1080p", 25, False, True, "ONLINE"),
            ("CAM-AHM-007", "Drive-In Road - Himalaya Mall Chowk", "AHM", ps_vastrapur.id, 23.0512, 72.5312, "Honeywell", "HBL6GR2", "Genetec Omnicast", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm007", "1080p", 25, False, True, "ONLINE"),
            ("CAM-AHM-008", "Vastrapur Lake East Perimeter", "AHM", ps_vastrapur.id, 23.0354, 72.5298, "Dahua", "IPC-HDBW5241E", "HikCentral", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm008", "1080p", 25, False, False, "ONLINE"),
            ("CAM-AHM-009", "SG Hwy - Thaltej Underpass North Exit", "AHM", ps_bodakdev.id, 23.0560, 72.5188, "Hikvision", "DS-2CD7A26G0/P", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm009", "1080p", 30, True, True, "ONLINE"),
            ("CAM-AHM-010", "Science City Road Junction", "AHM", ps_bodakdev.id, 23.0725, 72.5170, "Axis", "P1455-LE", "Genetec Omnicast", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm010", "1080p", 25, False, True, "ONLINE"),
            ("CAM-AHM-011", "SG Hwy - Gota Flyover South Approach", "AHM", ps_bodakdev.id, 23.0980, 72.5320, "CP Plus", "CP-UNC-DA41ZL", "HikCentral", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm011", "1080p", 25, False, True, "ONLINE"),
            ("CAM-AHM-012", "SP Ring Road - Science City Toll Exit", "AHM", ps_bodakdev.id, 23.0850, 72.4870, "Matrix", "SATATYA CIDR50", "Matrix SATATYA", "ONVIF", "onvif://gateway.sentinelx.local/onvif/ahm012", "1080p", 25, False, True, "ONLINE"),
            ("CAM-AHM-013", "SG Hwy - Chharodi Nirma University Gate", "AHM", ps_bodakdev.id, 23.1250, 72.5440, "Hikvision", "DS-2CD7A26G0/P", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm013", "1080p", 30, True, True, "ONLINE"),
            ("CAM-AHM-014", "SG Hwy - Vaishnodevi Circle Intersect", "AHM", ps_bodakdev.id, 23.1388, 72.5510, "Axis", "Q1656-LE", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm014", "4K", 30, True, True, "ONLINE"),
            ("CAM-AHM-015", "SP Ring Road - Vaishnodevi East Ramp", "AHM", ps_bodakdev.id, 23.1410, 72.5590, "Dahua", "DH-IPC-HFW5442", "Genetec Omnicast", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm015", "1080p", 25, False, True, "ONLINE"),
            ("CAM-AHM-016", "Ashram Road - Income Tax Crossroad", "AHM", ps_vastrapur.id, 23.0410, 72.5710, "Hikvision", "iDS-2CD7A46G0/P", "HikCentral", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm016", "1080p", 25, True, True, "ONLINE"),
            ("CAM-AHM-017", "Riverfront West - Nehru Bridge Entry", "AHM", ps_vastrapur.id, 23.0260, 72.5765, "Honeywell", "HBL6GR2", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm017", "1080p", 25, False, False, "ONLINE"),
            ("CAM-AHM-018", "Kalupur Railway Station Plaza Post", "AHM", ps_vastrapur.id, 23.0285, 72.6015, "CP Plus", "CP-UNC-TA41ZL", "HikCentral", "HLS", "https://gateway.sentinelx.local/hls/ahm018.m3u8", "1080p", 25, True, True, "ONLINE"),
            ("CAM-AHM-019", "Narol Circle - Industrial Highway Entry", "AHM", ps_vastrapur.id, 22.9730, 72.5930, "Matrix", "SATATYA CIDR50", "Matrix SATATYA", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm019", "720p", 20, False, True, "DEGRADED"),
            ("CAM-AHM-020", "Geeta Mandir Central Bus Port Post", "AHM", ps_vastrapur.id, 23.0125, 72.5890, "Dahua", "IPC-HDBW5241E", "Genetec Omnicast", "RTSP", "rtsp://gateway.sentinelx.local/live/ahm020", "1080p", 25, False, False, "OFFLINE"),

            # GANDHINAGAR (15 cameras)
            ("CAM-GND-021", "Ahmedabad-GND Hwy - Koba Circle Post", "GND", ps_infocity.id, 23.1610, 72.6310, "Hikvision", "DS-2CD7A26G0/P", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/gnd021", "1080p", 30, True, True, "ONLINE"),
            ("CAM-GND-022", "Koba-Gandhinagar Road - PDPU Junction", "GND", ps_infocity.id, 23.1550, 72.6630, "Axis", "Q1656-LE", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/gnd022", "1080p", 25, False, True, "ONLINE"),
            ("CAM-GND-023", "Bhaijipura Crossroad - GIFT City Spur", "GND", ps_infocity.id, 23.1750, 72.6450, "Dahua", "DH-IPC-HFW5442", "Genetec Omnicast", "RTSP", "rtsp://gateway.sentinelx.local/live/gnd023", "1080p", 25, True, True, "ONLINE"),
            ("CAM-GND-024", "GIFT City Gate 1 - North Boulevard", "GND", ps_infocity.id, 23.1590, 72.6840, "Hikvision", "iDS-2CD7A46G0/P", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/gnd024", "4K", 30, True, True, "ONLINE"),
            ("CAM-GND-025", "Infocity Gate 1 - DA-IICT Crossroad", "GND", ps_infocity.id, 23.1890, 72.6280, "CP Plus", "CP-UNC-TA41ZL", "HikCentral", "RTSP", "rtsp://gateway.sentinelx.local/live/gnd025", "1080p", 25, False, True, "ONLINE"),
            ("CAM-GND-026", "Indroda Circle - National Highway Post", "GND", ps_infocity.id, 23.2010, 72.6420, "Axis", "P1455-LE", "Genetec Omnicast", "RTSP", "rtsp://gateway.sentinelx.local/live/gnd026", "1080p", 25, False, True, "ONLINE"),
            ("CAM-GND-027", "CH Road - GH-0 Junction Approach", "GND", ps_sector7.id, 23.2100, 72.6390, "Matrix", "SATATYA CIDR50", "Matrix SATATYA", "ONVIF", "onvif://gateway.sentinelx.local/onvif/gnd027", "1080p", 25, False, True, "ONLINE"),
            ("CAM-GND-028", "CH-0 Circle - Pathikashram North Post", "GND", ps_sector7.id, 23.2180, 72.6450, "Hikvision", "DS-2CD7A26G0/P", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/gnd028", "1080p", 30, True, True, "ONLINE"),
            ("CAM-GND-029", "GH Road - Sector 11 Bus Station Post", "GND", ps_sector7.id, 23.2240, 72.6510, "Honeywell", "HBL6GR2", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/gnd029", "1080p", 25, False, True, "ONLINE"),
            ("CAM-GND-030", "Swarnim Sankul 1 - Cabinet Entrance", "GND", ps_sector7.id, 23.2260, 72.6570, "Axis", "Q1656-LE", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/gnd030", "4K", 30, True, True, "ONLINE"),
            ("CAM-GND-031", "New Sachivalaya Gate 2 Checkpost", "GND", ps_sector7.id, 23.2290, 72.6610, "Hikvision", "iDS-2CD7A46G0/P", "Genetec Omnicast", "RTSP", "rtsp://gateway.sentinelx.local/live/gnd031", "1080p", 25, True, True, "ONLINE"),
            ("CAM-GND-032", "CH-3 Circle - Sector 17 Crossroad", "GND", ps_sector7.id, 23.2350, 72.6480, "CP Plus", "CP-UNC-DA41ZL", "HikCentral", "HLS", "https://gateway.sentinelx.local/hls/gnd032.m3u8", "1080p", 25, False, True, "ONLINE"),
            ("CAM-GND-033", "Mahatma Mandir Convention Hall North", "GND", ps_sector7.id, 23.2210, 72.6330, "Dahua", "DH-IPC-HFW5442", "Genetec Omnicast", "RTSP", "rtsp://gateway.sentinelx.local/live/gnd033", "1080p", 25, True, False, "ONLINE"),
            ("CAM-GND-034", "Sector 24 GIDC Highway Entry Checkpost", "GND", ps_sector7.id, 23.2520, 72.6650, "Matrix", "SATATYA CIDR50", "Matrix SATATYA", "ONVIF", "onvif://gateway.sentinelx.local/onvif/gnd034", "1080p", 25, False, True, "OFFLINE"),
            ("CAM-GND-035", "Vidhan Sabha Marg - Sector 10 Approach", "GND", ps_sector7.id, 23.2310, 72.6540, "Hikvision", "DS-2CD7A26G0/P", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/gnd035", "1080p", 30, True, True, "ONLINE"),

            # SURAT (7 cameras)
            ("CAM-SRT-036", "Ring Road - Majura Gate Junction", "SRT", ps_varachha.id, 21.1760, 72.8220, "Hikvision", "DS-2CD7A26G0/P", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/srt036", "1080p", 30, True, True, "ONLINE"),
            ("CAM-SRT-037", "Dumas Road - VR Mall Crossroad", "SRT", ps_varachha.id, 21.1490, 72.7720, "Axis", "Q1656-LE", "Genetec Omnicast", "RTSP", "rtsp://gateway.sentinelx.local/live/srt037", "1080p", 25, False, True, "ONLINE"),
            ("CAM-SRT-038", "Athwagate Chowk - Tapi River Bridge", "SRT", ps_varachha.id, 21.1850, 72.8110, "Dahua", "DH-IPC-HFW5442", "HikCentral", "RTSP", "rtsp://gateway.sentinelx.local/live/srt038", "1080p", 25, True, True, "ONLINE"),
            ("CAM-SRT-039", "Varachha Main Road - Mini Bazar Junction", "SRT", ps_varachha.id, 21.2180, 72.8640, "CP Plus", "CP-UNC-TA41ZL", "HikCentral", "HLS", "https://gateway.sentinelx.local/hls/srt039.m3u8", "1080p", 25, False, True, "ONLINE"),
            ("CAM-SRT-040", "Surat Railway Station Ring Rd Overbridge", "SRT", ps_varachha.id, 21.2050, 72.8410, "Hikvision", "iDS-2CD7A46G0/P", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/srt040", "1080p", 30, True, True, "ONLINE"),
            ("CAM-SRT-041", "Kamrej Toll Plaza - NH48 Entry Checkpost", "SRT", ps_varachha.id, 21.2720, 72.9640, "Matrix", "SATATYA CIDR50", "Matrix SATATYA", "ONVIF", "onvif://gateway.sentinelx.local/onvif/srt041", "1080p", 25, False, True, "ONLINE"),
            ("CAM-SRT-042", "Sachin GIDC Main Industrial Gate Post", "SRT", ps_varachha.id, 21.0850, 72.8710, "Honeywell", "HBL6GR2", "Genetec Omnicast", "RTSP", "rtsp://gateway.sentinelx.local/live/srt042", "720p", 20, False, True, "OFFLINE"),

            # VADODARA (4 cameras)
            ("CAM-BRD-043", "Alkapuri - RC Dutt Road Intersect", "BRD", None, 22.3120, 73.1780, "Hikvision", "DS-2CD7A26G0/P", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/brd043", "1080p", 25, True, True, "ONLINE"),
            ("CAM-BRD-044", "Sayajigunj - Railway Station Circle", "BRD", None, 22.3100, 73.1890, "Axis", "P1455-LE", "Genetec Omnicast", "RTSP", "rtsp://gateway.sentinelx.local/live/brd044", "1080p", 25, False, True, "ONLINE"),
            ("CAM-BRD-045", "NE1 Expressway Vadodara Toll Exit Post", "BRD", None, 22.3550, 73.2150, "Dahua", "DH-IPC-HFW5442", "HikCentral", "RTSP", "rtsp://gateway.sentinelx.local/live/brd045", "1080p", 30, True, True, "ONLINE"),
            ("CAM-BRD-046", "Fatehgunj Circle - MSU University Campus", "BRD", None, 22.3240, 73.1920, "CP Plus", "CP-UNC-TA41ZL", "HikCentral", "RTSP", "rtsp://gateway.sentinelx.local/live/brd046", "1080p", 25, False, True, "ONLINE"),

            # RAJKOT (4 cameras)
            ("CAM-RJK-047", "Kalawad Road - KKV Hall Overbridge Post", "RJK", None, 22.2850, 70.7710, "Hikvision", "DS-2CD7A26G0/P", "Milestone XProtect", "RTSP", "rtsp://gateway.sentinelx.local/live/rjk047", "1080p", 25, True, True, "ONLINE"),
            ("CAM-RJK-048", "Yagnik Road - Imperial Chowk Crossroad", "RJK", None, 22.2980, 70.7980, "Axis", "Q1656-LE", "Genetec Omnicast", "RTSP", "rtsp://gateway.sentinelx.local/live/rjk048", "1080p", 25, False, True, "ONLINE"),
            ("CAM-RJK-049", "Gondal Chowkdi - NH27 Ring Road Flyover", "RJK", None, 22.2420, 70.8090, "Dahua", "DH-IPC-HFW5442", "HikCentral", "RTSP", "rtsp://gateway.sentinelx.local/live/rjk049", "1080p", 30, True, True, "ONLINE"),
            ("CAM-RJK-050", "Madhapar Chowkdi - Jamnagar Highway Entry", "RJK", None, 22.3310, 70.7680, "Matrix", "SATATYA CIDR50", "Matrix SATATYA", "ONVIF", "onvif://gateway.sentinelx.local/onvif/rjk050", "1080p", 25, False, True, "ONLINE"),
        ]

        camera_objs = {}
        for (code, name, dist_code, ps_id, lat, lng, vendor, model, vms, proto, url, res, fps, ptz, anpr, status) in cameras_metadata:
            cam = Camera(
                camera_code=code,
                name=name,
                department_id=dept_home.id,
                district_id=district_map[dist_code].id,
                police_station_id=ps_id,
                zone="Urban Central" if "AHM" in code or "SRT" in code else "High Security Zone",
                latitude=lat,
                longitude=lng,
                vendor=vendor,
                model=model,
                vms=vms,
                protocol=proto,
                stream_url=url,
                resolution=res,
                fps=fps,
                ptz_support=ptz,
                anpr_enabled=anpr,
                audio_enabled=False,
                night_vision=True,
                status=status,
                retention_period=30,
            )
            db.add(cam)
            await db.flush()
            camera_objs[code] = cam

            # Camera health record
            health = CameraHealth(
                camera_id=cam.id,
                fps=float(fps) if status == "ONLINE" else 0.0,
                latency_ms=35 if status == "ONLINE" else (180 if status == "DEGRADED" else 9999),
                packet_loss_pct=0.02 if status == "ONLINE" else (14.5 if status == "DEGRADED" else 100.0),
                bitrate_kbps=4096 if status == "ONLINE" else (1200 if status == "DEGRADED" else 0),
                last_heartbeat=datetime.utcnow() if status != "OFFLINE" else datetime.utcnow() - timedelta(hours=4),
                status=status,
            )
            db.add(health)

        # 7. WATCHLISTS
        wl_wanted = Watchlist(
            name="State High-Priority Crime & Stolen Vehicles",
            description="Active hotlist for serious crimes, stolen vehicles, and felony suspects",
            priority="HIGH",
            category="WANTED",
            is_active=True,
            created_by="Inspector V. K. Patel (CID Crime)",
        )
        wl_traffic = Watchlist(
            name="Frequent Traffic Violators & Suspended Registrations",
            description="Repeated signal jumps, over-speeding >100 km/h on SG Highway",
            priority="LOW",
            category="TRAFFIC_OFFENDER",
            is_active=True,
            created_by="Gujarat Traffic Enforcement Cell",
        )
        db.add_all([wl_wanted, wl_traffic])
        await db.flush()

        # Watchlist Vehicles
        # Demo Vehicle GJ01AB1234
        wv_target = WatchlistVehicle(
            watchlist_id=wl_wanted.id,
            plate_number="GJ01AB1234",
            reason="Wanted: Getaway SUV in C.G. Road Jewellery Heist",
            case_number="FIR-402/2026-NAVRANGPURA",
            priority="HIGH",
            notes="White Tata Safari. Armed suspects reported. Alert control room immediately upon ANPR detection.",
            is_active=True,
        )
        wv_stolen = WatchlistVehicle(
            watchlist_id=wl_wanted.id,
            plate_number="GJ05XY9182",
            reason="Stolen Commercial Fleet Vehicle - Surat Varachha",
            case_number="FIR-118/2026-VARACHHA",
            priority="MEDIUM",
            notes="Mahindra Bolero Pickup. Stolen from commercial yard.",
            is_active=True,
        )
        wv_reckless = WatchlistVehicle(
            watchlist_id=wl_traffic.id,
            plate_number="GJ18AA7721",
            reason="Repeated Over-speeding Violations (>110 km/h)",
            case_number="E-CHALLAN-88912",
            priority="LOW",
            notes="Hyundai Creta. Multiple unpaid automated challans.",
            is_active=True,
        )
        db.add_all([wv_target, wv_stolen, wv_reckless])
        await db.flush()

        # 8. PRIMARY HACKATHON DEMO: GJ01AB1234 VEHICLE DETECTIONS
        # Sequence of 7 cameras between 08:42:17 and 09:36:12 on 25 September 2026
        base_time = datetime(2026, 9, 25, 8, 42, 17)
        demo_journey_stops = [
            ("CAM-AHM-001", base_time, "TRK-AHM-12882", 48.0, "North", 0.974, "/evidence/snapshots/GJ01AB1234_cam001.jpg"),
            ("CAM-AHM-004", base_time + timedelta(minutes=5, seconds=35), "TRK-AHM-12940", 52.5, "North-East", 0.968, "/evidence/snapshots/GJ01AB1234_cam004.jpg"),
            ("CAM-AHM-009", base_time + timedelta(minutes=11, seconds=14), "TRK-AHM-13105", 61.2, "North", 0.981, "/evidence/snapshots/GJ01AB1234_cam009.jpg"),
            ("CAM-AHM-014", base_time + timedelta(minutes=18, seconds=55), "TRK-AHM-13420", 65.0, "North-East", 0.979, "/evidence/snapshots/GJ01AB1234_cam014.jpg"),
            ("CAM-GND-021", base_time + timedelta(minutes=35, seconds=14), "TRK-GND-04118", 58.4, "East", 0.967, "/evidence/snapshots/GJ01AB1234_cam021.jpg"),
            ("CAM-GND-028", base_time + timedelta(minutes=46, seconds=27), "TRK-GND-04390", 45.0, "North", 0.985, "/evidence/snapshots/GJ01AB1234_cam028.jpg"),
            ("CAM-GND-035", base_time + timedelta(minutes=53, seconds=55), "TRK-GND-04522", 38.2, "North-West", 0.991, "/evidence/snapshots/GJ01AB1234_cam035.jpg"),
        ]

        last_detection_id = None
        for cam_code, det_time, trk_id, speed, heading, conf, snap in demo_journey_stops:
            cam = camera_objs[cam_code]
            det = VehicleDetection(
                camera_id=cam.id,
                timestamp=det_time,
                tracking_id=trk_id,
                plate_number="GJ01AB1234",
                plate_confidence=conf,
                vehicle_type="SUV",
                vehicle_color="White",
                latitude=cam.latitude,
                longitude=cam.longitude,
                speed_kmh=speed,
                heading=heading,
                snapshot_url=snap,
                video_reference=f"vms://milestone.ahmedabad/{cam_code}/clip_{det_time.strftime('%H%M%S')}.mp4",
                is_flagged=True,
                created_at=det_time
            )
            db.add(det)
            await db.flush()
            last_detection_id = det.id

            anpr = ANPRDetection(
                detection_id=det.id,
                camera_id=cam.id,
                plate_number="GJ01AB1234",
                confidence=conf,
                state_code="GJ",
                raw_text="GJ01AB1234",
                verified=True,
                timestamp=det_time
            )
            evt = CameraEvent(
                camera_id=cam.id,
                timestamp=det_time,
                event_type="ANPR_DETECTED",
                object_type="vehicle",
                confidence=conf,
                latitude=cam.latitude,
                longitude=cam.longitude,
                image_reference=snap,
                video_reference=det.video_reference,
                metadata_json=f'{{"plate":"GJ01AB1234","speed_kmh":{speed},"type":"SUV","color":"White"}}',
                created_at=det_time
            )
            db.add_all([anpr, evt])

        # 9. REALTIME ALERT FOR GJ01AB1234
        cam_koba = camera_objs["CAM-GND-021"]
        demo_alert = Alert(
            alert_type="WATCHLIST_MATCH",
            priority="HIGH",
            title="WATCHLIST MATCH: GJ01AB1234 (High Priority)",
            description=f"Flagged suspect vehicle GJ01AB1234 detected at {cam_koba.name} ({cam_koba.camera_code}) heading East at 58.4 km/h.",
            camera_id=cam_koba.id,
            vehicle_detection_id=last_detection_id,
            watchlist_id=wl_wanted.id,
            plate_number="GJ01AB1234",
            status="NEW",
            created_at=base_time + timedelta(minutes=35, seconds=14)
        )
        db.add(demo_alert)

        # 10. BACKGROUND TRAFFIC (Additional vehicles)
        bg_vehicles = [
            ("GJ01CD4521", "Sedan", "Silver", ["CAM-AHM-002", "CAM-AHM-003", "CAM-AHM-005"]),
            ("GJ05XY9182", "SUV", "Black", ["CAM-SRT-036", "CAM-SRT-038", "CAM-SRT-040"]),
            ("GJ18AA7721", "Hatchback", "Red", ["CAM-GND-025", "CAM-GND-026", "CAM-GND-029"]),
            ("GJ27BB9001", "Truck", "Blue", ["CAM-AHM-011", "CAM-AHM-015"]),
            ("GJ03KL5544", "Sedan", "White", ["CAM-RJK-047", "CAM-RJK-048", "CAM-RJK-049"]),
        ]
        for plate, vtype, color, cams in bg_vehicles:
            bg_time = base_time + timedelta(minutes=15)
            for c_code in cams:
                if c_code in camera_objs:
                    c = camera_objs[c_code]
                    v_det = VehicleDetection(
                        camera_id=c.id,
                        timestamp=bg_time,
                        tracking_id=f"TRK-{c_code[-3:]}-{plate[-4:]}",
                        plate_number=plate,
                        plate_confidence=0.952,
                        vehicle_type=vtype,
                        vehicle_color=color,
                        latitude=c.latitude,
                        longitude=c.longitude,
                        speed_kmh=42.0,
                        heading="South",
                        snapshot_url=f"/evidence/snapshots/{plate}_{c_code}.jpg",
                        video_reference=None,
                        is_flagged=(plate == "GJ05XY9182" or plate == "GJ18AA7721"),
                        created_at=bg_time
                    )
                    db.add(v_det)
                    bg_time += timedelta(minutes=8)

        # 11. INVESTIGATION CASE
        inv_case = Investigation(
            case_number="INV-2026-0402",
            title="Navrangpura C.G. Road Jewellery Heist - Vehicle Route Investigation",
            description="Armed robbery suspects escaped in a White Tata Safari with registration GJ01AB1234. Cross-camera vehicle correlation requested across Ahmedabad and Gandhinagar jurisdictions.",
            officer_id=user_objs["investigator"].id,
            officer_name=user_objs["investigator"].full_name,
            priority="HIGH",
            status="IN_PROGRESS",
            target_plates="GJ01AB1234",
            created_at=base_time + timedelta(hours=1)
        )
        db.add(inv_case)
        await db.flush()

        inv_note1 = InvestigationNote(
            investigation_id=inv_case.id,
            author_name="Inspector V. K. Patel",
            note="Vehicle tracked moving Northbound on SG Highway from Iscon (08:42:17) through Vaishnodevi Circle (09:01:12) into Gandhinagar via Koba Circle (09:17:31). Last sighted near Vidhan Sabha Marg.",
            created_at=base_time + timedelta(hours=1, minutes=10)
        )
        inv_evidence1 = InvestigationEvidence(
            investigation_id=inv_case.id,
            evidence_type="SNAPSHOT",
            title="ANPR High-Confidence Plate Capture at Koba Circle",
            description="Clear frontal capture showing plate GJ01AB1234 with HSRP security hologram visible. Confidence 96.7%.",
            file_url="/evidence/snapshots/GJ01AB1234_cam021.jpg",
            camera_id=camera_objs["CAM-GND-021"].id,
            detection_id=last_detection_id,
            captured_at=base_time + timedelta(minutes=35, seconds=14),
            chain_of_custody="Captured by CAM-GND-021; Hash: sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            created_at=base_time + timedelta(hours=1, minutes=15)
        )
        db.add_all([inv_note1, inv_evidence1])

        await db.commit()
        logger.info("Successfully seeded SentinelX with 50 cameras, demo vehicle GJ01AB1234 journey, watchlists, alerts, and investigations!")

if __name__ == "__main__":
    asyncio.run(seed_data())
