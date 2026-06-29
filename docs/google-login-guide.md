# Hướng dẫn triển khai Google Login (One Tap + OAuth Button)
### Spring Boot + Next.js — BA → Dev → Tester

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [BA — Phân tích nghiệp vụ](#2-ba--phân-tích-nghiệp-vụ)
3. [Setup Google Console](#3-setup-google-console)
4. [Backend — Spring Boot](#4-backend--spring-boot)
5. [Frontend — Next.js](#5-frontend--nextjs)
6. [Tester — Kịch bản kiểm thử](#6-tester--kịch-bản-kiểm-thử)

---

## 1. Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│   ┌─────────────────┐        ┌──────────────────────┐      │
│   │   One Tap Prompt│        │  OAuth Button (GSI)  │      │
│   │  (góc trên phải)│        │  (nằm trong form)    │      │
│   └────────┬────────┘        └──────────┬───────────┘      │
│            └──────────┬─────────────────┘                  │
│                       │ response.credential (id_token JWT)  │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼ POST /api/auth/google { idToken }
┌─────────────────────────────────────────────────────────────┐
│                    SPRING BOOT BACKEND                      │
│                                                             │
│   GoogleTokenVerifier → Decode payload (email, name, pic)   │
│         ↓                                                   │
│   UserRepository.findByEmail()                              │
│         ↓                                                   │
│   Tồn tại? → update info     Chưa có? → tạo mới            │
│         ↓                                                   │
│   JwtService.generateToken() → trả JWT của hệ thống        │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼ { accessToken, user }
              Client lưu token → redirect dashboard
```

**Nguyên tắc cốt lõi:** One Tap và OAuth Button đều trả về cùng một `id_token` — backend chỉ cần 1 endpoint duy nhất.

---

## 2. BA — Phân tích nghiệp vụ

### 2.1 User Stories

| ID | Vai trò | Hành động | Kết quả mong đợi |
|----|---------|-----------|-----------------|
| US-01 | Người dùng mới | Click "Sign in with Google" / One Tap | Tài khoản được tạo tự động, được redirect vào dashboard |
| US-02 | Người dùng cũ | Đăng nhập lại bằng Google | Đăng nhập thành công, dữ liệu cũ vẫn còn |
| US-03 | Người dùng đã có tài khoản email | Đăng nhập bằng Google cùng email | Hệ thống nhận ra và liên kết account |
| US-04 | Người dùng trên Safari/Firefox | Xem trang login | Không thấy One Tap nhưng vẫn thấy OAuth Button |
| US-05 | Người dùng đóng One Tap | Xem trang login | Vẫn thấy OAuth Button để thay thế |

### 2.2 Acceptance Criteria

**US-01 — Đăng ký mới qua Google**
- [ ] Sau khi click, hệ thống tạo record user trong DB với `provider = GOOGLE`
- [ ] Trường `password` để null (không bắt buộc nhập)
- [ ] Avatar lấy từ Google profile
- [ ] Chuyển hướng về `/dashboard` sau khi thành công
- [ ] Không hiện màn hình đăng ký thêm thông tin

**US-02 — Đăng nhập lại**
- [ ] Nhận ra user qua email
- [ ] Cập nhật `picture` nếu user đổi avatar Google
- [ ] Thời gian xử lý < 2 giây

**US-03 — Tài khoản email trùng**
- [ ] Không tạo tài khoản mới
- [ ] Cập nhật `provider = GOOGLE` và `googleId`
- [ ] Giữ nguyên toàn bộ dữ liệu cũ

### 2.3 Business Rules

| Rule | Mô tả |
|------|-------|
| BR-01 | `email` là khóa định danh duy nhất, không phải `googleId` |
| BR-02 | `googleId` (sub field) ổn định hơn email khi user đổi Gmail |
| BR-03 | Token Google chỉ có hiệu lực 1 giờ, JWT hệ thống 24 giờ |
| BR-04 | Chỉ chấp nhận email đã verified từ Google (`email_verified = true`) |
| BR-05 | Không lưu `access_token` hay `refresh_token` của Google |

### 2.4 Luồng nghiệp vụ

```
[Trang Login]
     │
     ├─► [One Tap hiện?] ──Yes──► [User click "Continue as X"]
     │                                        │
     │   [Không?]                             │
     │     │                                  │
     └─►  [OAuth Button] ──► [Chọn account]  │
                                    │         │
                                    └────┬────┘
                                         │ id_token
                                         ▼
                              [Backend verify token]
                                         │
                              ┌──────────┴──────────┐
                              │                     │
                         [Email mới?]         [Email cũ?]
                              │                     │
                         [Tạo user]           [Update info]
                              │                     │
                              └──────────┬──────────┘
                                         │
                              [Tạo JWT hệ thống]
                                         │
                                  [Redirect /dashboard]
```

### 2.5 ERD

```
users
├── id            UUID, PK
├── email         VARCHAR(255), UNIQUE, NOT NULL
├── name          VARCHAR(255)
├── picture       TEXT
├── password      VARCHAR(255), NULLABLE   -- null nếu Google login
├── provider      ENUM('LOCAL', 'GOOGLE')
├── google_id     VARCHAR(255), NULLABLE   -- Google's "sub" field
├── created_at    TIMESTAMP
└── updated_at    TIMESTAMP
```

---

## 3. Setup Google Console

### Bước 1 — Tạo project

1. Truy cập [console.cloud.google.com](https://console.cloud.google.com)
2. **New Project** → đặt tên (vd: `my-app-auth`)
3. Chọn project vừa tạo

### Bước 2 — Cấu hình OAuth Consent Screen

1. Menu trái → **APIs & Services** → **OAuth consent screen**
2. Chọn **External** → **Create**
3. Điền:
   - App name: tên app của bạn
   - User support email: email của bạn
   - Developer contact: email của bạn
4. **Save and Continue** (bỏ qua Scopes và Test users)

### Bước 3 — Tạo OAuth Credentials

1. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. Application type: **Web application**
3. Thêm **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://yourdomain.com
   ```
4. Thêm **Authorized redirect URIs** (cho OAuth Button flow):
   ```
   http://localhost:3000
   https://yourdomain.com
   ```
5. **Create** → Lưu lại `Client ID` và `Client Secret`

> **Lưu ý:** One Tap dùng JavaScript origins, không cần redirect URI phức tạp vì xử lý bằng callback.

### Bước 4 — Biến môi trường

```env
# .env (Spring Boot)
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
JWT_SECRET=your-256-bit-secret-key-minimum-32-characters
JWT_EXPIRATION=86400000

# .env.local (Next.js)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 4. Backend — Spring Boot

### 4.1 Cấu trúc project

```
src/main/java/com/yourapp/
├── config/
│   ├── SecurityConfig.java
│   └── CorsConfig.java
├── controller/
│   └── AuthController.java
├── dto/
│   ├── GoogleLoginRequest.java
│   └── AuthResponse.java
├── entity/
│   ├── User.java
│   └── AuthProvider.java (enum)
├── filter/
│   └── JwtAuthFilter.java
├── repository/
│   └── UserRepository.java
└── service/
    ├── AuthService.java
    ├── GoogleTokenVerifierService.java
    └── JwtService.java
```

### 4.2 pom.xml — Dependencies

```xml
<dependencies>
    <!-- Spring Boot starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- Google API Client để verify id_token -->
    <dependency>
        <groupId>com.google.api-client</groupId>
        <artifactId>google-api-client</artifactId>
        <version>2.2.0</version>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>

    <!-- DB -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

### 4.3 application.yml

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/yourdb
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

google:
  client-id: ${GOOGLE_CLIENT_ID}

jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION:86400000}

# CORS
cors:
  allowed-origins: http://localhost:3000,https://yourdomain.com
```

### 4.4 Entity

```java
// entity/AuthProvider.java
public enum AuthProvider {
    LOCAL, GOOGLE
}

// entity/User.java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String picture;

    private String password;  // null với Google login

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider;

    @Column(name = "google_id")
    private String googleId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

### 4.5 Repository

```java
// repository/UserRepository.java
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

### 4.6 DTOs

```java
// dto/GoogleLoginRequest.java
public record GoogleLoginRequest(
    @NotBlank(message = "idToken is required")
    String idToken
) {}

// dto/AuthResponse.java
public record AuthResponse(
    String accessToken,
    String tokenType,
    UserInfo user
) {
    public record UserInfo(
        String id,
        String email,
        String name,
        String picture
    ) {}

    // Factory method tiện lợi
    public static AuthResponse of(String token, User user) {
        return new AuthResponse(
            token,
            "Bearer",
            new UserInfo(user.getId(), user.getEmail(), user.getName(), user.getPicture())
        );
    }
}
```

### 4.7 GoogleTokenVerifierService

```java
// service/GoogleTokenVerifierService.java
@Service
@Slf4j
public class GoogleTokenVerifierService {

    @Value("${google.client-id}")
    private String clientId;

    /**
     * Verify id_token từ Google và trả về payload.
     * Hoạt động với cả One Tap lẫn OAuth Button — cùng format.
     *
     * @throws IllegalArgumentException nếu token không hợp lệ
     * @throws RuntimeException nếu gặp lỗi kỹ thuật
     */
    public GoogleIdToken.Payload verify(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier
                .Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(clientId))
                .build();

            GoogleIdToken token = verifier.verify(idToken);

            if (token == null) {
                throw new IllegalArgumentException("Invalid or expired Google token");
            }

            GoogleIdToken.Payload payload = token.getPayload();

            // BR-04: Chỉ chấp nhận email đã verified
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new IllegalArgumentException("Google email is not verified");
            }

            return payload;

        } catch (GeneralSecurityException | IOException e) {
            log.error("Failed to verify Google token", e);
            throw new RuntimeException("Token verification failed", e);
        }
    }
}
```

### 4.8 JwtService

```java
// service/JwtService.java
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        return Jwts.builder()
            .setSubject(user.getId())
            .claim("email", user.getEmail())
            .claim("name", user.getName())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    public String extractUserId(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
}
```

### 4.9 AuthService

```java
// service/AuthService.java
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final GoogleTokenVerifierService googleVerifier;
    private final JwtService jwtService;

    /**
     * Xử lý đăng nhập Google — dùng chung cho One Tap và OAuth Button.
     * Logic: verify token → lấy email → findOrCreate user → trả JWT.
     */
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        // Bước 1: Verify id_token với Google
        GoogleIdToken.Payload payload = googleVerifier.verify(request.idToken());

        String googleId = payload.getSubject();   // BR-02: dùng sub làm googleId
        String email    = payload.getEmail();
        String name     = (String) payload.get("name");
        String picture  = (String) payload.get("picture");

        log.info("Google login attempt for email: {}", email);

        // Bước 2: Find or Create (BR-01: email là khóa)
        User user = userRepository.findByEmail(email)
            .map(existing -> updateExistingUser(existing, googleId, name, picture))
            .orElseGet(() -> createNewUser(email, name, picture, googleId));

        // Bước 3: Tạo JWT của hệ thống (BR-03: không lưu token Google)
        String jwt = jwtService.generateToken(user);

        log.info("Google login successful for userId: {}", user.getId());

        return AuthResponse.of(jwt, user);
    }

    /**
     * US-02, US-03: Cập nhật thông tin nếu user đã tồn tại.
     */
    private User updateExistingUser(User user, String googleId, String name, String picture) {
        user.setGoogleId(googleId);
        user.setPicture(picture);       // cập nhật avatar mới nhất
        user.setName(name);
        user.setProvider(AuthProvider.GOOGLE);
        return userRepository.save(user);
    }

    /**
     * US-01: Tạo user mới từ thông tin Google.
     */
    private User createNewUser(String email, String name, String picture, String googleId) {
        User newUser = User.builder()
            .email(email)
            .name(name)
            .picture(picture)
            .googleId(googleId)
            .provider(AuthProvider.GOOGLE)
            .password(null)   // BR-04: không có password
            .build();

        return userRepository.save(newUser);
    }
}
```

### 4.10 AuthController

```java
// controller/AuthController.java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint duy nhất cho cả One Tap lẫn OAuth Button.
     * POST /api/auth/google
     * Body: { "idToken": "eyJhbGci..." }
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request) {

        AuthResponse response = authService.loginWithGoogle(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy thông tin user hiện tại (cần JWT).
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserInfo> getCurrentUser(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
            new AuthResponse.UserInfo(
                user.getId(), user.getEmail(), user.getName(), user.getPicture()
            )
        );
    }
}
```

### 4.11 Security Config

```java
// config/SecurityConfig.java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> {
                    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    res.getWriter().write("{\"error\":\"Unauthorized\"}");
                })
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

// filter/JwtAuthFilter.java
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (jwtService.isTokenValid(token)) {
            String userId = jwtService.extractUserId(token);

            userRepository.findById(userId).ifPresent(user -> {
                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                        user, null, Collections.emptyList()
                    );
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            });
        }

        filterChain.doFilter(request, response);
    }
}
```

### 4.12 Exception Handling

```java
// exception/GlobalExceptionHandler.java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        log.warn("Invalid request: {}", e.getMessage());
        return ResponseEntity.badRequest()
            .body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException e) {
        log.error("Internal error", e);
        return ResponseEntity.internalServerError()
            .body(Map.of("error", "Internal server error"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException e) {

        String message = e.getBindingResult().getFieldErrors()
            .stream()
            .map(f -> f.getField() + ": " + f.getDefaultMessage())
            .collect(Collectors.joining(", "));

        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
}
```

---

## 5. Frontend — Next.js

### 5.1 Cấu trúc project

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   └── dashboard/
│       └── page.tsx
├── components/
│   └── auth/
│       ├── GoogleOneTap.tsx
│       └── LoginForm.tsx
├── hooks/
│   └── useGoogleAuth.ts
├── lib/
│   ├── api.ts
│   └── auth.ts
└── types/
    └── auth.ts
```

### 5.2 Cài đặt dependencies

```bash
npm install @react-oauth/google
npm install -D @types/node
```

### 5.3 Types

```typescript
// types/auth.ts
export interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: UserInfo;
}

export interface GoogleCredentialResponse {
  credential: string;       // id_token JWT
  clientId: string;
  select_by: string;        // 'user_1tap' | 'user' | 'auto'
}
```

### 5.4 API Client

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Login failed');
  }

  return res.json();
}

export async function getMe(token: string): Promise<UserInfo> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}
```

### 5.5 Auth utilities

```typescript
// lib/auth.ts
const TOKEN_KEY = 'auth_token';

export const authUtils = {
  saveToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  isLoggedIn: (): boolean => {
    return !!authUtils.getToken();
  },
};
```

### 5.6 Hook useGoogleAuth

```typescript
// hooks/useGoogleAuth.ts
'use client';

import { useEffect, useCallback } from 'react';
import { googleLogin } from '@/lib/api';
import { authUtils } from '@/lib/auth';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    google: any;
  }
}

export function useGoogleAuth() {
  const router = useRouter();

  const handleSuccess = useCallback(async (idToken: string) => {
    try {
      const { accessToken, user } = await googleLogin(idToken);
      authUtils.saveToken(accessToken);
      router.push('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      // TODO: hiện toast error
    }
  }, [router]);

  const initGSI = useCallback(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: (response: { credential: string }) => {
        handleSuccess(response.credential);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true,  // hỗ trợ Chrome mới
    });

    // Kích hoạt One Tap
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        console.log('[OneTap] Not displayed:', notification.getNotDisplayedReason());
        // Lý do: opt_out_or_no_session | suppressed_by_user | unregistered_origin
      }
      if (notification.isSkippedMoment()) {
        console.log('[OneTap] Skipped:', notification.getSkippedReason());
        // Cooldown — user tự thấy OAuth Button là đủ
      }
    });

    // Render OAuth Button
    const btnEl = document.getElementById('google-signin-btn');
    if (btnEl) {
      window.google.accounts.id.renderButton(btnEl, {
        theme: 'outline',
        size: 'large',
        width: btnEl.offsetWidth || 380,
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
    }
  }, [handleSuccess]);

  useEffect(() => {
    // Load GIS script
    if (window.google) {
      initGSI();
      return;
    }

    const scriptId = 'google-gsi-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGSI;
      document.head.appendChild(script);
    }

    return () => {
      window.google?.accounts.id.cancel();
    };
  }, [initGSI]);
}
```

### 5.7 Login Page

```tsx
// app/(auth)/login/page.tsx
'use client';

import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useState } from 'react';

export default function LoginPage() {
  useGoogleAuth(); // Khởi tạo One Tap + OAuth Button

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Chào mừng quay trở lại</h1>
        </div>

        {/* 
          Div này sẽ được Google GIS render thành OAuth Button.
          One Tap sẽ tự hiện ở góc trên phải trình duyệt (không liên quan div này).
          Hai cái không xung đột nhau — dùng cùng callback.
        */}
        <div id="google-signin-btn" className="w-full mb-4" />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-400">Hoặc đăng nhập bằng email</span>
          </div>
        </div>

        {/* Email/Password form */}
        <EmailPasswordForm />
      </div>
    </div>
  );
}

function EmailPasswordForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
      >
        Đăng nhập
      </button>
    </form>
  );
}
```

### 5.8 Middleware bảo vệ route

```typescript
// middleware.ts (root level)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/api/auth'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const isPublic = PUBLIC_PATHS.some(p => request.nextUrl.pathname.startsWith(p));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

> **Lưu ý:** Middleware của Next.js chạy trên Edge Runtime không đọc được `localStorage`. Nếu cần bảo vệ route phía server, lưu token vào `httpOnly cookie` thay vì `localStorage`. Middleware trên dùng cookie làm ví dụ.

---

## 6. Tester — Kịch bản kiểm thử

### 6.1 Test Environment Setup

```bash
# Chạy backend
./mvnw spring-boot:run

# Chạy frontend
npm run dev

# Reset One Tap cooldown khi test (chạy trong DevTools console)
document.cookie = `g_state=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
```

**Tool gợi ý:**
- API testing: Postman / Bruno / curl
- E2E: Playwright / Cypress
- DB inspection: DBeaver / TablePlus

---

### 6.2 API Test Cases — Backend

#### TC-BE-01: Đăng nhập thành công với token hợp lệ

```
Method:  POST
URL:     http://localhost:8080/api/auth/google
Headers: Content-Type: application/json
Body:    { "idToken": "<valid_google_id_token>" }

Expected Response: 200 OK
{
  "accessToken": "eyJhbGci...",
  "tokenType": "Bearer",
  "user": {
    "id": "uuid-here",
    "email": "user@gmail.com",
    "name": "Nguyen Van A",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}

DB Check: SELECT * FROM users WHERE email = 'user@gmail.com';
→ Phải có 1 record với provider = 'GOOGLE'
```

#### TC-BE-02: Token không hợp lệ

```
Body:    { "idToken": "invalid.token.here" }

Expected Response: 400 Bad Request
{ "error": "Invalid or expired Google token" }
```

#### TC-BE-03: Token bị thiếu

```
Body:    { "idToken": "" }

Expected Response: 400 Bad Request
{ "error": "idToken: idToken is required" }
```

#### TC-BE-04: Token hết hạn (> 1 giờ)

```
Body:    { "idToken": "<expired_google_token>" }

Expected Response: 400 Bad Request
{ "error": "Invalid or expired Google token" }
```

#### TC-BE-05: Email đã tồn tại trong DB — không tạo duplicate

```
Precondition: User với email X đã có trong DB

Action: POST /api/auth/google với token của email X

Expected Response: 200 OK (không phải 201)

DB Check: SELECT COUNT(*) FROM users WHERE email = 'X';
→ Phải bằng 1, không phải 2
```

#### TC-BE-06: Gọi /api/auth/me không có token

```
Method:  GET
URL:     http://localhost:8080/api/auth/me
Headers: (không có Authorization)

Expected Response: 401 Unauthorized
{ "error": "Unauthorized" }
```

#### TC-BE-07: Gọi /api/auth/me với JWT hợp lệ

```
Method:  GET
URL:     http://localhost:8080/api/auth/me
Headers: Authorization: Bearer <accessToken từ TC-BE-01>

Expected Response: 200 OK
{
  "id": "...",
  "email": "user@gmail.com",
  "name": "...",
  "picture": "..."
}
```

#### TC-BE-08: Email chưa verified bởi Google

```
Precondition: Tạo token giả có email_verified = false

Expected Response: 400 Bad Request
{ "error": "Google email is not verified" }
```

---

### 6.3 Frontend / E2E Test Cases

#### TC-FE-01: One Tap hiển thị khi có session Google

```
Precondition:
  - Browser đang đăng nhập Google
  - Chưa opt-out One Tap
  - Cookie g_state chưa bị set (không trong cooldown)

Steps:
  1. Mở http://localhost:3000/login
  2. Đợi 1-2 giây

Expected:
  - Prompt nhỏ xuất hiện góc trên phải
  - Hiện tên + email + avatar của tài khoản Google
  - Có nút "Continue as [Tên]"
```

#### TC-FE-02: One Tap không hiện trên Safari/Firefox

```
Precondition: Dùng Safari hoặc Firefox

Steps:
  1. Mở http://localhost:3000/login

Expected:
  - Không hiện One Tap prompt
  - OAuth Button vẫn hiển thị bình thường trong form
  - Không có lỗi JS trong console
```

#### TC-FE-03: Click One Tap → đăng nhập thành công

```
Steps:
  1. Mở trang login (One Tap đang hiển thị)
  2. Click "Continue as [Tên]"

Expected:
  - Redirect về /dashboard trong vòng 3 giây
  - localStorage có key 'auth_token'
  - Không hiện lỗi
```

#### TC-FE-04: Click OAuth Button → đăng nhập thành công

```
Steps:
  1. Mở trang login
  2. Click nút "Sign in with Google" trong form
  3. Chọn tài khoản Google trong popup

Expected:
  - Redirect về /dashboard
  - localStorage có 'auth_token'
```

#### TC-FE-05: Đóng One Tap → OAuth Button vẫn dùng được

```
Steps:
  1. Mở trang login (One Tap hiện)
  2. Click X để đóng One Tap
  3. Click OAuth Button trong form

Expected:
  - OAuth Button vẫn hoạt động bình thường
  - Đăng nhập thành công
```

#### TC-FE-06: Truy cập dashboard không có token

```
Steps:
  1. Xoá localStorage (hoặc dùng incognito)
  2. Truy cập http://localhost:3000/dashboard

Expected:
  - Redirect về /login
  - Không hiện nội dung dashboard
```

#### TC-FE-07: Token hết hạn → redirect login

```
Steps:
  1. Set token hết hạn vào localStorage
  2. Truy cập /dashboard

Expected:
  - API /me trả 401
  - Redirect về /login
  - Token bị xoá khỏi localStorage
```

---

### 6.4 Kiểm thử nghiệp vụ (BR Validation)

| Test ID | Business Rule | Kịch bản | Kết quả mong đợi |
|---------|--------------|----------|-----------------|
| TC-BR-01 | BR-01: email là khóa | Đăng nhập 2 lần cùng email | DB chỉ có 1 record |
| TC-BR-02 | BR-02: googleId từ sub | Kiểm tra DB sau login | `google_id` = Google's `sub` field |
| TC-BR-03 | BR-03: token expire | Dùng JWT sau 24h | 401 Unauthorized |
| TC-BR-04 | BR-04: email_verified | Token với `email_verified=false` | 400 Bad Request |
| TC-BR-05 | BR-05: không lưu Google token | Kiểm tra DB sau login | Không có cột `google_access_token` |

---

### 6.5 Checklist trước khi release

#### Backend
- [ ] `GOOGLE_CLIENT_ID` đúng với production domain
- [ ] `JWT_SECRET` đủ 256-bit và không commit lên git
- [ ] CORS chỉ cho phép domain production (bỏ localhost)
- [ ] Exception handler không leak stack trace ra response
- [ ] Log không in ra id_token

#### Frontend
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` đúng
- [ ] `NEXT_PUBLIC_API_URL` trỏ về production API
- [ ] Production domain đã được thêm vào Google Console (Authorized JavaScript origins)
- [ ] Xử lý trường hợp network error (no internet)
- [ ] Token được lưu an toàn (cân nhắc httpOnly cookie thay localStorage)

#### Google Console
- [ ] OAuth Consent Screen đã được Google review (nếu cần external user)
- [ ] Production domain đã verify
- [ ] Authorized JavaScript origins đã có domain production

---

*Tài liệu này bao gồm toàn bộ luồng từ phân tích nghiệp vụ đến implement và kiểm thử. Cập nhật lần cuối theo Spring Boot 3.x và Next.js 14 App Router.*
