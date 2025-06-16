FROM registry.cn-shenzhen.aliyuncs.com/zlt2000/openjdk:17-jre-headless

MAINTAINER zlt2000

RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

ADD target/multi-table-service.jar app.jar

EXPOSE 7003

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app.jar"] 