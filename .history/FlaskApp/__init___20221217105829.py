from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from pymongo import MongoClient
import jwt
import bcrypt
from datetime import date
import datetime
from bson import ObjectId
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient, BlobBlock
import os
import uuid
import tempfile
from functools import wraps
import time
"""
    项目注意事项：
        后端这一块儿用的是Azure blob，Azure cosmos mongo，Azure function
        自己搜一下这些东西的好处就能写进ppt
        Azure blob需要开启视频流式传输（cli内输入指令，具体指令谷歌里有）
        Azure blob需要开启CORS服务（portal里就可以设置）
        Azure blob需要设置azure function的访问权限（部署后，部署前要在本地azure cli内登录账号）
        文件内我用<>包括的部分要根据自己的订阅改url
    项目启动方式：
        进入venv环境
        func start
    以下是我mongodb的文件存储结构：
        用户数据：
        管理员
            {
            "_id" : ObjectId("638e03a5a683f23fed47b9bf"),
            "username" : "admin",
            "password" : {
                "$binary" : "JDJiJDEyJGJuZXM5UE9McUtrRnBUZlk0ZFJZQU92NjRUTW5LSHVtRzFrOXhXU0x1LzRoNXU1L3FrbGRL",
                "$type" : "00"
            },
            "email" : "Zhang-T5@ulster.ac.uk",
            "identity" : "admin",
            "collectVideo" : [
                ObjectId("6392aba30d15cf16e518fca7")
            ]
            }
        上传者
            {
            "_id" : ObjectId("63966b94d223fa4cf52f3b78"),
            "username" : "admin2",
            "password" : {
                "$binary" : "JDJiJDEyJDlGMEdUbWFvTHpxb0Qyek9QMGlGOHVqbG80bFFheUp4Y2FDakdXWTJGZlpYYmVHVnMuekZD",
                "$type" : "00"
            },
            "email" : "hoshimi.akira19@gmail.com",
            "identity" : "up",
            "collectVideo" : [ ]
            }
        一般用户
            {
            "_id" : ObjectId("63966c04d223fa4cf52f3b79"),
            "username" : "newuser",
            "password" : {
                "$binary" : "JDJiJDEyJFg3eDBKVUZ1Yk1Ec3NOWHl0ZEt1eU9CdUF0eENvS3oxS24ycDFqci5MU2JTVUZxcGZoQUFP",
                "$type" : "00"
            },
            "email" : "333@qq.com",
            "identity" : "user",
            "collectVideo" : [
                ObjectId("6396316aa502cfb609bab6b5")
            ]
            }
         视频数据：
            {
            "_id" : ObjectId("6392ad220d15cf16e518fca9"),
            "title" : "Test8",
            "publisher" : "admin",
            "intro" : "Test8",
            "genre" : "Fantasy,Mystery",
            "video" : "https://havideoassblob.blob.core.windows.net/havideoassvideo/Test - 副本 (7).mp4",
            "cover" : "https://havideoassblob.blob.core.windows.net/havideoassimg/Test - 副本 (7).png",
            "comment" : [ ],
            "views" : 0,
            "collect" : 0,
            "producer" : "AAA",
            "date" : "2022-12-11"
        ·   }
"""

# 整个项目直接丢到function里就能部署，表面上是就是一个函数，记得让演示的时候不要打开api的function的详细页面，不然就露馅了
app = Flask(__name__)
CORS(app)
client = MongoClient("mongodb://cloudprojectcosmos:hKqRGz72oS67D6LM34ymaK21AZuREFcoxlR1ROjG7oEi5pGy0O5fizp5jPFCj3jKiuZGO0QxYKozACDbClfyiQ==@cloudprojectcosmos.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@cloudprojectcosmos@")
db = client.cloudnative
videos = db.videos
users = db.users
blacklist = db.blacklist
app.config['SECRET_KEY'] = 'mykey'
# 在使用blob存储前用azure cli在本地登陆一次
account_url = "https://cloudprojectblob.blob.core.windows.net"
default_credential = DefaultAzureCredential()
blob_service_client = BlobServiceClient(
    account_url, credential=default_credential)


@app.route("/")
def index():
    return (
        "hello world"
    )

# login check


def jwt_required(func):  # JWT authentication
    @wraps(func)
    def jwt_required_wrapper(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        # Get if the token is in the blacklist
        bl_token = blacklist.find_one({"token": token})
        if bl_token is not None:
            # If the token is in the black list
            return make_response(jsonify({'message': 'Token has been cencelled'}), 401)
        if not token:
            # If the token is invalid
            return make_response(jsonify({'message': 'Token is missing'}), 401)
        try:
            # Try to decode token
            print(token)
            data = jwt.decode(
                token, app.config['SECRET_KEY'], 'HS256')
            print("parse Token: {}", data)
        except Exception as e:
            # Token is invalid
            print(e)
            return make_response(jsonify({'message': 'Token is invalid'}), 401)
        return func(*args, **kwargs)
    return jwt_required_wrapper


@app.route('/cloud/api/v1/status', methods=['POST'])
@jwt_required
def status():
    return make_response(jsonify({"message": "ok"}), 200)


@app.route('/cloud/api/v1/login', methods=['POST'])
def login():
    # user的唯一key是email
    # form内需要email和password
    data = request.form
    email = data.get("email")
    password = data.get("password")
    if (not email or not password):
        return make_response(jsonify({"please pass the email and the password"}), 404)
    if email != "":
        user = users.find_one({'email': email})
        if user is not None:
            if bcrypt.checkpw(bytes(password, 'UTF-8'), user["password"]):
                # 加密内容包括user的身份
                token = jwt.encode({'user': user["email"], 'identity': user["identity"], 'exp': datetime.datetime.utcnow(
                ) + datetime.timedelta(minutes=30), 'userid': str(user['_id'])}, app.config['SECRET_KEY'], 'HS256')
                # 返回token，username，user身份和userid
                return make_response(jsonify({'token': token, 'username': user["username"], 'identity': user["identity"], 'id': str(user["_id"])}), 200)
            else:
                return make_response(jsonify({'error': 'Wrong password'}), 401)
        else:
            return make_response(jsonify({'error': 'Not find this Email'}), 401)
    else:
        return make_response(jsonify({'error': 'Email required'}), 401)
    # 前段要从error中检索error获取返回信息
# register
# form需求用户email，用户名，密码，form内需包含认证用户是否符合管理员注册资格


@app.route('/cloud/api/v1/register', methods=['POST'])
def register():
    data = request.form
    if not data.get("email"):
        return make_response(jsonify({"error": "Please pass the email"}), 404)
    if not data.get("username"):
        return make_response(jsonify({"error": "Please pass the username"}), 404)
    if not data.get("password"):
        return make_response(jsonify({"error": "Please pass the password"}), 404)
    if not data.get("confirm"):
        return make_response(jsonify({"error": "Please pass the confirm"}), 404)
    email = data["email"]
    if (users.find_one({'email': email}) != None):
        return make_response(jsonify({'error': 'Email have been used'}), 401)
    username = data["username"]
    password = data["password"]
    # confirm用于辨认是否创建的是管理员账户
    confirm = data["confirm"]
    try:

        password = password.encode('UTF-8')
        password = bcrypt.hashpw(password,
                                 bcrypt.gensalt())

    except Exception as e:
        return make_response(jsonify({"message": "Failed when hash password", "error": e.message}), 404)

    # if (confirm != "up"):
    info = {
        "username": username,
        "password": password,
        "email": email,
        "identity": "user",
        "collectVideo": []
    }
    """ else:
        info = {
            "username": username,
            "password": password,
            "email": email,
            "identity": "up",
            "collectVideo": []
        } """

    users.insert_one(info)
    return make_response(jsonify({"message": "Sign up success"}), 200)

# upload，需要上传视频文件，图片封面，和视频的各项信息
# form需求视频信息


@app.route('/cloud/api/v1/video', methods=['POST'])
@jwt_required
def upload():
    data = request.form
    files = request.files
    tempFilePath = tempfile.gettempdir()

    vid = files.get("video")
    if vid is None:
        return make_response(jsonify({'message': "Please select the video"}), 400)
    currentTime = str(int(time.time()))
    # 首先拼接当前的时间戳来生成随机的文件名
    videoName = currentTime + vid.filename
    # 视频文件地址
    video_path = os.path.join(tempFilePath, videoName)
    # 保存到临时文件
    vid.save(video_path)
    # 视频文件容器
    # blob名称为视频文件名
    video_client = blob_service_client.get_blob_client(
        container="cloudprojectvideo", blob=videoName)
    # 获取cover名称
    cover = files.get("cover")
    # 拼接成随机的cover名称
    cover_name = currentTime + cover.filename
    # 判断是否获取到cover
    if cover is None:
        return make_response(jsonify({'message': "Please select the cover"}), 400)
        # 生成一个cover_path
    cover_path = os.path.join(tempFilePath, cover_name)
    # 保存cover到指定路径
    cover.save(cover_path)
    # 图片文件容器
    # 名称为随机生成的
    cover_client = blob_service_client.get_blob_client(
        container="cloudprojectpicture/", blob=cover_name)
    block_list = []
    chunk_size = 1024*1024
    # 分段上传
    # 从刚才写到的文件中读取
    with open(file=video_path, mode="rb") as videodata:
        while True:
            read_data = videodata.read(chunk_size)
            if not read_data:
                break
            blk_id = str(uuid.uuid4())
            video_client.stage_block(block_id=blk_id, data=read_data)
            block_list.append(BlobBlock(block_id=blk_id))
    video_client.commit_block_list(block_list)
    with open(file=cover_path, mode="rb") as coverdata:
        cover_client.upload_blob(coverdata)
    # 容器路径加文件名生成文件路径
    coverurl = "cloudprojectpicture/" + cover_name
    videourl = "cloudprojectvideo/" + videoName
    # 获取下用户信息
    try:
        token = request.headers['x-access-token']
        user_data = jwt.decode(
            token, app.config['SECRET_KEY'], 'HS256')
        info = {
            "title": data["title"],  # 标题
            "publisher": data["publisher"],  # 上传者
            "intro": data["intro"],  # 视频简介
            "genre": data["genre"],  # 视频类型
            "video": videourl,
            "cover": coverurl,
            "comment": [],
            "producer": data["producer"],  # 视频制作者
            "views": 0,
            "collect": 0,
            "date": date.today().isoformat(),  # 上传日期,
            "uploader": user_data['userid'],
        }
        videos.insert_one(info)
        return make_response(jsonify({'message': "Upload video success."}), 200)
    except Exception as e:
        print(e)
        # blob中blob名相同会导致错误，如果你不想用文件名生成blob名可以改一个名字生成方式
        return make_response(jsonify({'message': "Upload fail.Please Change your file name", "error": e.message}), 400)
# 视频列表


@ app.route("/cloud/api/v1/video", methods=["GET"])
def show_all_videos():
    # 参数中传每页显示的视频数量
    page_num, page_size = 1, 9
    if request.args.get('pn'):
        page_num = int(request.args.get('pn'))
    if request.args.get('ps'):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))
    data_to_return = []
    showdata = []
    for video in videos.find().sort("_id", -1):
        video["_id"] = str(video["_id"])
        showdata.append(video)
    # 搜索功能，参数中获取搜索的内容
    if request.args.get("title") is not None:
        title = request.args.get("title")
        print("title", title)
        showdata = title_filter(showdata, title)
    if request.args.get("publisher") is not None:
        publisher = request.args.get("publisher")
        showdata = publisher_filter(showdata, publisher)
    if request.args.get("producer") is not None:
        producer = request.args.get("producer")
        showdata = producer_filter(showdata, producer)
    if request.args.get("genre") is not None:
        genre = request.args.get("genre")
        showdata = genre_filter(showdata, genre)
    # 生成简易版本的返回信息（相比视频的所有信息），不想用翻页功能把循环的范围删了
    for video in showdata[page_start:page_start+page_size]:
        data = {
            "_id": video["_id"],
            "picSrc": video["cover"],
            "title": video["title"],
            "views": video["views"],
            "collect": video["collect"],
            "date": video["date"]
        }

        data_to_return.append(data)

    return make_response(jsonify(data_to_return), 200)

# 单页的视频播放


@ app.route("/cloud/api/v1/<string:id>", methods=["GET"])
@ jwt_required
def show_one_video(id):
    data_to_return = []
    comment_to_return = []
    try:
        video = videos.find_one({'_id': ObjectId(id)})
    except:
        return make_response(jsonify({"error": "Wrong Video ID"}), 404)
    if video is not None:
        videos.update_one({"_id": ObjectId(id)}, {
                          "$set": {"views": video["views"]+1}})
        video['_id'] = str(video['_id'])
        video["views"] += 1
        video["check"] = False
        if video.get("comment") is not None:
            for comment in video["comment"]:
                comment["_id"] = str(comment["_id"])
                comment_to_return.append(comment)
        video["comment"] = comment_to_return
        data_to_return.append(video)
        return make_response(jsonify(data_to_return), 200)
    else:
        return make_response(jsonify({"message": "Wrong video ID"}), 404)
# 添加评论
# form需求用户id，用户名，评论内容，评分


@ app.route("/cloud/api/v1/video/<string:id>/comment", methods=["POST"])
@ jwt_required
def add_comment(id):
    video = videos.find_one({'_id': ObjectId(id)})
    if video is not None:
        new_comment = {
            "_id": ObjectId(),
            "user_id": request.form["user_id"],
            "username": request.form["username"],
            "comment": request.form["comment"],
            "mark": request.form["mark"],
            "date": date.today().isoformat()
        }
        print(new_comment["user_id"])
        print(new_comment["comment"])
        print(new_comment["mark"])
        videos.update_one({"_id": ObjectId(id)}, {
                          "$push": {"comment": new_comment}})
        return make_response(jsonify({"success": "Add Comment Success"}), 201)
    else:
        return make_response(jsonify({"message": "Wrong video ID"}), 404)
# 上传字幕文件
# 需求字幕文件


@ app.route("/cloud/api/v1/video/<string:id>/subtitle", methods=["POST"])
@ jwt_required
def add_subtitle(id):
    video = videos.find_one({'_id': ObjectId(id)})
    if video is not None:
        files = request.files
        tempFilePath = tempfile.gettempdir()
        subtitle = files["subtitle"]
        subtitleName = subtitle.filename
        subtitle.save(tempFilePath+"/"+subtitleName)
        subtitle_path = os.path.join(tempFilePath, subtitleName)
        subtitle_client = blob_service_client.get_blob_client(
            container="<container.name>", blob=subtitleName)
        try:
            with open(file=subtitle_path, mode="rb") as vttdata:
                subtitle_client.upload_blob(vttdata)
            vtturl = "<container.url>"+subtitleName
            videos.update_one({"_id": ObjectId(id)}, {"$set": {"vtt": vtturl}})
            return make_response(jsonify({"success": "The video have the subtitle now"}), 201)
        except:
            return make_response(jsonify({'error': "Upload fail.Please Change your file name"}), 400)
    else:
        return make_response(jsonify({"error": "Invalid video ID"}), 404)
# 删除视频


@ app.route("/cloud/api/v1/video/<string:id>", methods=["DELETE"])
@ jwt_required
def delete_video(id):
    try:
        video = videos.find_one({'_id': ObjectId(id)})
    except:
        response = jsonify({"error": "Wrong video ID"})
        return make_response(response, 404)
    video = videos.find_one({'_id': ObjectId(id)})
    if video is not None:
        # 替换文件url获取blob名字
        videoName = video["video"].replace("<container.url/>", "")
        video_client = blob_service_client.get_blob_client(
            container="<container.name>", blob=videoName)
        coverName = video["cover"].replace("container.url/", "")
        cover_client = blob_service_client.get_blob_client(
            container="<container.name>", blob=coverName)
        video_client.delete_blob()
        cover_client.delete_blob()
        result = videos.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 1:
            return make_response({"success": "Delete Video Success"}, 204)
    else:
        response = jsonify({"error": "Wrong video ID"})
        return make_response(response, 404)

# 删除评论


@ app.route("/cloud/api/v1/video/<string:vid>/comment/<string:cid>", methods=["DELETE"])
@ jwt_required
def delete_comment(vid, cid):
    try:
        video = videos.find_one({'_id': ObjectId(vid)})
        comment = ObjectId(cid)
    except:
        response = jsonify({"error": "Wrong video ID"})
        response.headers.add('Access-Control-Allow-Methods', 'DELETE')
        response.headers.add('Access-Control-Allow-Origin', '*')
        return make_response(response), 404
    videos.update_one(
        {"_id": ObjectId(vid)},
        {"$pull": {"comment":
                   {"_id": ObjectId(cid)}}})
    return make_response(jsonify({"success": "delete success"}), 204)


# 判断某个视频是否在用户收藏中
@app.route("/cloud/api/v1/user/collections/<string:id>", methods=['GET'])
@jwt_required
def get_if_video_in_collection(id):
    token = request.headers['x-access-token']
    user_data = jwt.decode(
        token, app.config['SECRET_KEY'], 'HS256')
    user = users.aggregate([{"$match": {"_id": ObjectId(user_data['userid'])}}, {
                           "$match": {"collectVideo": {"$in": ObjectId(id)}}}])
    if user is None:
        return make_response(jsonify({"message": "no"}), 404)
    else:
        return make_response(jsonify({"message": "ok"}), 200)

# 视频添加收藏
# form需求用户id


@ app.route("/cloud/api/v1/video/<string:id>", methods=["POST"])
@ jwt_required
def add_collection(id):
    video = videos.find_one({'_id': ObjectId(id)})
    if video is not None:
        collectNum = video["collect"]
        uid = request.form["id"]
        videos.update_one({"_id": ObjectId(id)}, {
                          "$set": {"collect": collectNum+1}})
        users.update_one({"_id": ObjectId(uid)}, {
                         "$push": {"collectVideo": ObjectId(id)}})
        return make_response(jsonify({"success": "Add Collect Success"}), 201)
    else:
        return make_response(jsonify({"error": "Wrong video ID"}), 404)
# 显示视频收藏页，基本等同于显示所有视频
# 参数需求用户id


@ app.route("/api/v1/collection", methods=["GET"])
@ jwt_required
def show_all_collection():
    page_num, page_size = 1, 9
    if request.args.get('pn'):
        page_num = int(request.args.get('pn'))
    if request.args.get('ps'):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))
    data_to_return = []
    showdata = []
    uid = request.args.get('id')
    user = users.find_one({'_id': ObjectId(uid)})
    # 获取用户收藏的视频
    for video in videos.find().sort("_id", -1):
        for col in user["collectVideo"]:
            if (str(col) == str(video["_id"])):
                video["_id"] = str(video["_id"])
                showdata.append(video)
    if request.args.get("title") != "":
        title = request.args.get("title")
        print("title", title)
        showdata = title_filter(showdata, title)
    if request.args.get("publisher") != "":
        publisher = request.args.get("publisher")
        showdata = publisher_filter(showdata, publisher)
    if request.args.get("producer") != "":
        producer = request.args.get("producer")
        showdata = producer_filter(showdata, producer)
    if request.args.get("genre") != "":
        genre = request.args.get("genre")
        showdata = genre_filter(showdata, genre)
    for video in showdata[page_start:page_start+page_size]:
        data = {
            "id": video["_id"],
            "picSrc": video["cover"],
            "title": video["title"],
            "views": video["views"],
            "collect": video["collect"],
            "date": video["date"]
        }

        data_to_return.append(data)
    return make_response(jsonify(data_to_return), 200)
# 取消收藏


@ app.route("/cloud/api/v1/video/<string:id>/cancel", methods=["POST"])
@ jwt_required
def cancel_collection(id):
    video = videos.find_one({'_id': ObjectId(id)})
    if video is not None:
        collectNum = video["collect"]
        uid = request.form["id"]
        videos.update_one({"_id": ObjectId(id)}, {
                          "$set": {"collect": collectNum-1}})
        users.update_one({"_id": ObjectId(uid)}, {
                         "$pull": {"collectVideo": ObjectId(id)}})
        return make_response(jsonify({"success": "Cancel Collect Success"}), 201)
    else:
        return make_response(jsonify({"error": "Wrong video ID"}), 404)

# 视频标题过滤器


def title_filter(showdata, title):
    data_to_return = []
    for video in showdata:
        if str(video["title"]).lower().find(title.lower()) != -1:
            data_to_return.append(video)
    return data_to_return

# 视频上传者过滤器


def publisher_filter(showdata, publisher):
    data_to_return = []
    for video in showdata:
        if publisher.lower() in video["publisher"].lower():
            data_to_return.append(video)
    return data_to_return
# 视频制作者过滤器


def producer_filter(showdata, producer):
    data_to_return = []
    for video in showdata:
        if producer.lower() in video["producer"].lower():
            data_to_return.append(video)
    return data_to_return
# 视频类型过滤器


def genre_filter(showdata, genre):
    data_to_return = []
    for video in showdata:
        if genre.lower() in video["genre"].lower():
            data_to_return.append(video)
    return data_to_return


if __name__ == "__main__":
    app.run()
